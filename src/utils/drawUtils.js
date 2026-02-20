// ─── Geometry helpers ─────────────────────────────────────────────────────────

export function ccw(A, B, C) {
  return (C.cy - A.cy) * (B.cx - A.cx) > (B.cy - A.cy) * (C.cx - A.cx);
}

export function segmentsIntersect(A, B, C, D) {
  if (
    (A.cx === C.cx && A.cy === C.cy) || (A.cx === D.cx && A.cy === D.cy) ||
    (B.cx === C.cx && B.cy === C.cy) || (B.cx === D.cx && B.cy === D.cy)
  ) return false;
  return (ccw(A, C, D) !== ccw(B, C, D)) && (ccw(A, B, C) !== ccw(A, B, D));
}

export function toImgCoord(cx, cy, canvasW, canvasH, imgW, imgH) {
  return {
    x: Math.round((cx * imgW / canvasW) * 2) / 2,
    y: Math.round((cy * imgH / canvasH) * 2) / 2,
  };
}

export function toCanvasCoord(ix, iy, canvasW, canvasH, imgW, imgH) {
  return {
    cx: ix * canvasW / imgW,
    cy: iy * canvasH / imgH,
  };
}

export function getCursorPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    cx: (e.clientX - rect.left) * scaleX,
    cy: (e.clientY - rect.top)  * scaleY,
  };
}

// ─── Canvas drawing helpers ───────────────────────────────────────────────────

export const ROI_COLORS = [
  '#22c55e','#3b82f6','#a855f7','#f97316',
  '#ec4899','#14b8a6','#eab308','#ef4444','#06b6d4','#84cc16',
];

export const PEOPLE_COLORS  = ['#22c55e', '#3b82f6', '#f97316'];
export const PEOPLE_LABELS  = ['Main Line', 'Entry Direction', 'Exit Direction'];
export const PEOPLE_TYPES   = ['line-crossing-Main', 'line-crossing-Entry', 'line-crossing-Exit'];

export function drawPolygon(ctx, pts, color, closed) {
  if (pts.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].cx, pts[0].cy);
  pts.slice(1).forEach(p => ctx.lineTo(p.cx, p.cy));
  if (closed) ctx.closePath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.stroke();
  if (closed) {
    ctx.fillStyle = color + '28';
    ctx.fill();
  }
  pts.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.cx, p.cy, i === 0 ? 6 : 4, 0, Math.PI * 2);
    ctx.fillStyle   = i === 0 ? color : '#fff';
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.fill();
    ctx.stroke();
  });
}

export function drawArrowLine(ctx, pts, color) {
  if (pts.length < 2) {
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.cx, p.cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });
    return;
  }
  ctx.beginPath();
  ctx.moveTo(pts[0].cx, pts[0].cy);
  pts.slice(1).forEach(p => ctx.lineTo(p.cx, p.cy));
  ctx.strokeStyle = color;
  ctx.lineWidth   = 2.5;
  ctx.setLineDash([]);
  ctx.stroke();

  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  drawArrow(ctx, prev.cx, prev.cy, last.cx, last.cy, color);

  pts.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.cx, p.cy, i === 0 ? 5 : 3.5, 0, Math.PI * 2);
    ctx.fillStyle   = i === 0 ? color : '#fff';
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.fill();
    ctx.stroke();
  });
}

export function drawArrow(ctx, x1, y1, x2, y2, color) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size  = 14;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - size * Math.cos(angle - Math.PI / 6), y2 - size * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - size * Math.cos(angle + Math.PI / 6), y2 - size * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export function drawLabel(ctx, text, cx, cy, color) {
  ctx.font = '600 11px "DM Sans", sans-serif';
  const w = ctx.measureText(text).width + 14;
  ctx.fillStyle = color + 'dd';
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, cy - 20, w, 20, 4);
  ctx.fill();
  ctx.fillStyle    = '#fff';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy - 10);
  ctx.textAlign = 'left';
}

export function drawDashedPreview(ctx, from, to, color) {
  ctx.beginPath();
  ctx.moveTo(from.cx, from.cy);
  ctx.lineTo(to.cx, to.cy);
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = color + '80';
  ctx.lineWidth   = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);
}