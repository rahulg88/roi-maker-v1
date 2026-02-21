import React, { useRef, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import ImageIcon from '@mui/icons-material/ImageOutlined';
import {
  drawPolygon, drawArrowLine, drawLabel, drawDashedPreview,
  toCanvasCoord, ROI_COLORS, PEOPLE_COLORS, PEOPLE_LABELS,
} from '../utils/drawUtils';

export default function DrawCanvas({
  imgRef, imgNatW, imgNatH,
  mode, roiState, peopleState,
  onCanvasClick, onRightClick, onMouseMove,
}) {
  const canvasRef = useRef(null);
  const hoverRef  = useRef(null);

  // Compute canvas size to fit wrapper maintaining aspect ratio
  const wrapperRef = useRef(null);

  const resize = useCallback(() => {
    const canvas  = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const W = wrapper.clientWidth;
    const aspect = imgNatW / imgNatH;
    let H = W / aspect;
    if (H > 560) H = 560;
    canvas.width  = Math.round(W);
    canvas.height = Math.round(H);
  }, [imgNatW, imgNatH]);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  // Redraw whenever state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Image
    if (imgRef.current) {
      ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
    }

    const W = canvas.width, H = canvas.height;
    const tc = (ix, iy) => toCanvasCoord(ix, iy, W, H, imgNatW, imgNatH);
    const hover = hoverRef.current;

    if (mode === 'roi') {
      // Completed ROIs
      roiState.polygons.forEach(poly => {
        const pts = poly.canvasPts;
        drawPolygon(ctx, pts, poly.color, true);
        const cx = pts.reduce((s, p) => s + p.cx, 0) / pts.length;
        const cy = pts.reduce((s, p) => s + p.cy, 0) / pts.length;
        drawLabel(ctx, `ROI ${poly.id}`, cx, cy, poly.color);
      });

      // Current in-progress
      const cur = roiState.current;
      if (cur.length > 0) {
        const color = ROI_COLORS[(roiState.nextId - 1) % ROI_COLORS.length];
        drawPolygon(ctx, cur, color, false);
        if (hover) drawDashedPreview(ctx, cur[cur.length - 1], hover, color);
      }
    } else {
      // People: completed lines
      peopleState.lines.forEach((line, i) => {
        if (!line) return;
        drawArrowLine(ctx, line.pts, line.color);
        drawLabel(ctx, PEOPLE_LABELS[i], line.pts[0].cx, line.pts[0].cy - 12, line.color);
      });
      // In-progress line
      const cur = peopleState.currentPts;
      if (cur.length > 0) {
        const color = PEOPLE_COLORS[peopleState.step] || '#fff';
        drawArrowLine(ctx, cur, color);
        if (hover) drawDashedPreview(ctx, cur[cur.length - 1], hover, color);
      }
    }
  });

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    hoverRef.current = {
      cx: (e.clientX - rect.left) * scaleX,
      cy: (e.clientY - rect.top)  * scaleY,
    };
    onMouseMove && onMouseMove();
  };

  const handleMouseLeave = () => { hoverRef.current = null; };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      cx: (e.clientX - rect.left) * scaleX,
      cy: (e.clientY - rect.top)  * scaleY,
    };
  };

  return (
    <Box ref={wrapperRef} sx={{
      position: 'relative',
      width: '100%',
      minHeight: 320,
      bgcolor: '#0d1117',
      borderTop:    '2px solid',
      borderBottom: '2px solid',
      borderColor: 'primary.main',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', cursor: 'crosshair', maxWidth: '100%' }}
        onClick={e => onCanvasClick(e, getPos(e), canvasRef.current)}
        onContextMenu={e => { e.preventDefault(); onRightClick(); }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      {!imgRef.current && (
        <Box sx={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
          gap: 1.5,
        }}>
          <Box
            component="img"
            src="/placeholder.jpg"
            alt="Upload placeholder"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.35,
              position: 'absolute',
              inset: 0,
            }}
          />
          <Box sx={{
            position: 'relative', zIndex: 1,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 1.5,
            color: 'rgba(255,255,255,0.7)',
          }}>
            <ImageIcon sx={{ fontSize: 52, opacity: 0.8 }} />
            <Box sx={{ fontSize: '0.82rem', fontWeight: 500 }}>
              Upload an image to begin drawing zones
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}