import React from 'react';

interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
}

// Deterministic matrix generator for local share links
export const QrCodeSvg: React.FC<QrCodeProps> = ({ value, size = 160, className = '' }) => {
  // Generate 25x25 QR-like deterministic pattern based on hash of value
  const N = 25;
  const matrix: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));

  // Helper to place finder pattern at (r, c)
  const placeFinder = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        const isBorder = i === 0 || i === 6 || j === 0 || j === 6;
        const isCenter = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        matrix[r + i][c + j] = isBorder || isCenter;
      }
    }
  };

  // 3 position detection patterns
  placeFinder(0, 0);
  placeFinder(0, N - 7);
  placeFinder(N - 7, 0);

  // Timing patterns
  for (let i = 8; i < N - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Alignment pattern
  const ar = N - 9;
  const ac = N - 9;
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const isBorder = i === 0 || i === 4 || j === 0 || j === 4;
      const isCenter = i === 2 && j === 2;
      matrix[ar + i][ac + j] = isBorder || isCenter;
    }
  }

  // Pseudo-random deterministic fill based on input string
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      // Skip finder zones
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= N - 8;
      const inBottomLeft = r >= N - 8 && c < 8;
      const inTiming = r === 6 || c === 6;
      const inAlignment = r >= ar && r < ar + 5 && c >= ac && c < ac + 5;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming && !inAlignment) {
        const val = ((hash ^ (r * 13 + c * 37)) * 1103515245 + 12345) & 0x7fffffff;
        matrix[r][c] = (val % 3) !== 0;
      }
    }
  }

  const cellSize = size / N;

  return (
    <div className={`inline-block p-3 bg-white rounded-lg border border-neutral-200 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
        aria-label={`QR Code for ${value}`}
      >
        <rect width={size} height={size} fill="#FFFFFF" />
        {matrix.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize + 0.2}
                height={cellSize + 0.2}
                fill="#0F172A"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
};
