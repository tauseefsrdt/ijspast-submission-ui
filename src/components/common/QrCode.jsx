import React from 'react';

export function QrCode({ size = 130, value = 'upi://pay?pa=srmu.journals@bank&pn=SRMU%20Journals' }) {
  // Deterministic 21x21 QR visual representation
  const n = 21;
  let h = 7;
  const cells = [];
  const ring = (a, b) => {
    const m = Math.max(Math.abs(a - 3), Math.abs(b - 3));
    return m === 3 || m <= 1;
  };

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      h = (h * 1103515245 + 12345) & 0x7fffffff;
      let on;
      if (x < 7 && y < 7) on = ring(x, y);
      else if (x >= n - 7 && y < 7) on = ring(x - (n - 7), y);
      else if (x < 7 && y >= n - 7) on = ring(x, y - (n - 7));
      else on = (h >> 16) & 1;
      if (on) cells.push({ x, y });
    }
  }

  return (
    <div className="inline-flex flex-col items-center p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
      <svg
        viewBox="-1 -1 23 23"
        width={size}
        height={size}
        role="img"
        aria-label="Payment UPI QR code"
        className="shape-rendering-crispEdges"
      >
        <rect x="-1" y="-1" width="23" height="23" fill="#ffffff" />
        <g fill="#0f172a">
          {cells.map((c, i) => (
            <rect key={i} x={c.x} y={c.y} width="1" height="1" />
          ))}
        </g>
      </svg>
      <span className="text-[10px] font-mono tracking-tight text-slate-500 mt-2 font-medium">
        Scan with any UPI App
      </span>
    </div>
  );
}
