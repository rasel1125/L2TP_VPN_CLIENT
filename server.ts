import express from 'express';
import { createServer as createViteServer } from 'vite';
import net from 'net';
import dgram from 'dgram';
import dns from 'dns';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Helper to check if IP is private / CGNAT
  function isPrivateOrCgnat(ip: string): { isPrivate: boolean; reason: string } {
    if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('127.')) {
      return {
        isPrivate: true,
        reason: 'LAN Private IP (Only accessible within the same local network, not from internet)',
      };
    }
    if (ip.startsWith('172.')) {
      const secondOctet = parseInt(ip.split('.')[1], 10);
      if (secondOctet >= 16 && secondOctet <= 31) {
        return {
          isPrivate: true,
          reason: 'LAN Private IP (RFC 1918 class B)',
        };
      }
    }
    if (ip.startsWith('100.')) {
      const secondOctet = parseInt(ip.split('.')[1], 10);
      if (secondOctet >= 64 && secondOctet <= 127) {
        return {
          isPrivate: true,
          reason: 'ISP CGNAT Shared IP (Carrier Grade NAT - Inbound L2TP connections are blocked by your broadband provider unless you buy a Real Public IP)',
        };
      }
    }
    return { isPrivate: false, reason: 'Public Internet Routable IP' };
  }

  // Probe TCP Port helper
  function checkTcpPort(host: string, port: number, timeoutMs = 2500): Promise<{ open: boolean; latency: number }> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const socket = new net.Socket();

      socket.setTimeout(timeoutMs);

      socket.on('connect', () => {
        const latency = Date.now() - startTime;
        socket.destroy();
        resolve({ open: true, latency });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ open: false, latency: timeoutMs });
      });

      socket.on('error', () => {
        socket.destroy();
        resolve({ open: false, latency: Date.now() - startTime });
      });

      socket.connect(port, host);
    });
  }

  // Probe UDP Port helper (sends probe packet to L2TP 1701 or IPsec 500/4500)
  function checkUdpPort(host: string, port: number, timeoutMs = 2000): Promise<{ sent: boolean; latency: number }> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const socket = dgram.createSocket('udp4');
      // Dummy L2TP SCCRQ packet or zero-byte ping
      const probeMessage = Buffer.from([0xc8, 0x02, 0x00, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

      socket.send(probeMessage, port, host, (err) => {
        const latency = Date.now() - startTime;
        socket.close();
        if (err) {
          resolve({ sent: false, latency });
        } else {
          resolve({ sent: true, latency });
        }
      });
    });
  }

  // API Endpoint: MikroTik Live Probe & Diagnostics
  app.post('/api/mikrotik/check', async (req, res) => {
    const { serverAddress, username, password, ipsecPsk } = req.body;

    if (!serverAddress) {
      return res.status(400).json({ error: 'Server address is required' });
    }

    try {
      // 1. DNS Lookup
      let resolvedIp = serverAddress;
      let dnsLatency = 0;
      const dnsStart = Date.now();

      try {
        const lookupResult = await dns.promises.lookup(serverAddress);
        resolvedIp = lookupResult.address;
        dnsLatency = Date.now() - dnsStart;
      } catch (dnsErr) {
        // Might already be an IP or resolution failed
      }

      // 2. CGNAT / Private IP Check
      const ipType = isPrivateOrCgnat(resolvedIp);

      // 3. Port probes
      const [udp1701, udp500, udp4500, routerOsApi, webFigHttp, webFigHttps] = await Promise.all([
        checkUdpPort(resolvedIp, 1701), // L2TP
        checkUdpPort(resolvedIp, 500),  // IKE
        checkUdpPort(resolvedIp, 4500), // NAT-T
        checkTcpPort(resolvedIp, 8728, 1500), // MikroTik API
        checkTcpPort(resolvedIp, 80, 1500),   // WebFig
        checkTcpPort(resolvedIp, 443, 1500),  // WebFig SSL
      ]);

      // Generate customized MikroTik RouterOS Terminal Commands
      const mikrotikCommands = [
        `# --- 1. Enable L2TP Server with IPsec ---`,
        `/interface l2tp-server server set enabled=yes use-ipsec=yes ipsec-secret="${ipsecPsk || 'YOUR_IPSEC_SECRET'}" default-profile=default-encryption allow-fast-path=no`,
        ``,
        `# --- 2. Add Firewall Rules to Accept L2TP & IPsec (Input Chain) ---`,
        `/ip firewall filter add chain=input protocol=udp port=1701,500,4500 action=accept comment="Allow-L2TP-IPsec" place-before=0`,
        `/ip firewall filter add chain=input protocol=ipsec-esp action=accept comment="Allow-IPsec-ESP" place-before=0`,
        ``,
        `# --- 3. Create or Verify PPP Secret for "${username || 'YOUR_USER'}" ---`,
        `/ppp secret add name="${username || 'YOUR_USER'}" password="${password || 'YOUR_PASSWORD'}" service=l2tp profile=default-encryption local-address=192.168.89.1 remote-address=192.168.89.100 comment="L2TP Client User"`,
        ``,
        `# --- 4. Verify Active Connections on MikroTik ---`,
        `/ppp active print`,
        `/log print where topics~"l2tp|ipsec"`,
      ].join('\n');

      return res.json({
        success: true,
        resolvedIp,
        dnsLatency,
        ipType,
        ports: {
          l2tpUdp1701: udp1701,
          ikeUdp500: udp500,
          natUdp4500: udp4500,
          routerOsApi8728: routerOsApi,
          webFig80: webFigHttp,
          webFig443: webFigHttps,
        },
        diagnostics: {
          isWebBrowserLimitation: true,
          explanation:
            'A web browser cannot bind to raw UDP sockets or create an OS-level tun0/ppp0 VPN interface due to browser security sandbox rules. To register an active connection on MikroTik /ppp active, the connection must be established by your Android phone system VPN (Settings > VPN) or an Android native app (like StrongSwan or VpnCilla APK), pointing to this MikroTik server.',
          cgnatWarning: ipType.isPrivate,
          mikrotikCommands,
        },
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to probe MikroTik server',
      });
    }
  });

  // Mount Vite dev server middleware in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`L2TP VPN Client Server running on port ${PORT}`);
  });
}

startServer();
