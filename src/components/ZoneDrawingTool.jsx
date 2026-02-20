import React, { useRef, useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Stack,
  Snackbar, Alert, Tooltip, useMediaQuery, useTheme,
} from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import GestureIcon from '@mui/icons-material/Gesture';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import KeyboardIcon from '@mui/icons-material/KeyboardOutlined';

import DrawCanvas from './DrawCanvas';
import ImageSourcePanel from './ImageSourcePanel';
import OutputPanel from './OutputPanel';
import HintsPanel from './HintsPanel';
import { ROI_COLORS, PEOPLE_COLORS, segmentsIntersect, toImgCoord } from '../utils/drawUtils';

const INITIAL_ROI    = { polygons: [], current: [], nextId: 1 };
const INITIAL_PEOPLE = { lines: [], currentPts: [], step: 0 };

// Rescale a single {x, y} point when output dimensions change
function rescalePoint(p, scaleX, scaleY) {
  return { ...p, x: Math.round(p.x * scaleX * 2) / 2, y: Math.round(p.y * scaleY * 2) / 2 };
}

// Rescale a people point {_ix, _iy, cx, cy} — only output coords, canvas coords stay
function rescalePeoplePoint(p, scaleX, scaleY) {
  return {
    ...p,
    _ix: Math.round(p._ix * scaleX * 2) / 2,
    _iy: Math.round(p._iy * scaleY * 2) / 2,
  };
}

function ModeButton({ id, label, Icon, active, onClick }) {
  return (
    <Button
      onClick={() => onClick(id)}
      startIcon={<Icon sx={{ fontSize: '15px !important' }} />}
      size="small"
      sx={{
        px: 2, py: 0.9, borderRadius: 2,
        fontSize: '0.8rem', fontWeight: 600,
        color: active ? 'primary.main' : 'text.secondary',
        bgcolor: active ? 'rgba(0,230,118,0.1)' : 'transparent',
        border: '1px solid',
        borderColor: active ? 'rgba(0,230,118,0.3)' : 'transparent',
        transition: 'all 0.18s',
        '&:hover': {
          bgcolor: active ? 'rgba(0,230,118,0.14)' : 'rgba(255,255,255,0.05)',
          borderColor: active ? 'rgba(0,230,118,0.4)' : 'rgba(255,255,255,0.08)',
        },
      }}
    >
      {label}
    </Button>
  );
}

export default function ZoneDrawingTool() {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const imgRef = useRef(null);

  // imgNatW/H = the OUTPUT coordinate space (what coords are mapped to)
  const [imgNatW, setImgNatW] = useState(1280);
  const [imgNatH, setImgNatH] = useState(720);

  // Keep a ref of PREVIOUS dimensions so we can rescale on change
  const prevDims = useRef({ w: 1280, h: 720 });

  const [mode,        setMode]        = useState('roi');
  const [roiState,    setRoiState]    = useState(INITIAL_ROI);
  const [peopleState, setPeopleState] = useState(INITIAL_PEOPLE);
  const [error,       setError]       = useState('');
  const [, tick] = useState(0);
  const redraw = () => tick(n => n + 1);

  // ── Image loaded ────────────────────────────────────────────────────────────
  function handleImageLoaded(img) {
    imgRef.current = img;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    setImgNatW(w);
    setImgNatH(h);
    prevDims.current = { w, h };
    clearAll();
  }

  // ── Dimension change: rescale all stored coordinates ────────────────────────
  function handleDimensionChange(axis, val) {
    const oldW = prevDims.current.w;
    const oldH = prevDims.current.h;

    const newW = axis === 'width'  ? val : oldW;
    const newH = axis === 'height' ? val : oldH;

    const scaleX = newW / oldW;
    const scaleY = newH / oldH;

    // Rescale ROI polygons
    setRoiState(prev => ({
      ...prev,
      polygons: prev.polygons.map(poly => ({
        ...poly,
        points: poly.points.map(p => rescalePoint(p, scaleX, scaleY)),
        // canvasPts are canvas-space, they don't need rescaling
      })),
      // Also rescale in-progress points
      current: prev.current, // canvas coords, no change needed
    }));

    // Rescale people lines
    setPeopleState(prev => ({
      ...prev,
      lines: prev.lines.map(line => {
        if (!line) return line;
        return {
          ...line,
          pts: line.pts.map(p => rescalePeoplePoint(p, scaleX, scaleY)),
        };
      }),
      currentPts: prev.currentPts.map(p => rescalePeoplePoint(p, scaleX, scaleY)),
    }));

    // Update dimension state and prev ref
    if (axis === 'width')  setImgNatW(val);
    if (axis === 'height') setImgNatH(val);
    prevDims.current = { w: newW, h: newH };

    redraw();
  }

  // ── ROI ─────────────────────────────────────────────────────────────────────
  function roiAddPoint(cx, cy) {
    setRoiState(prev => {
      const pts = prev.current;
      if (pts.length >= 2) {
        for (let i = 0; i < pts.length - 2; i++) {
          if (segmentsIntersect(pts[i], pts[i+1], pts[pts.length-1], { cx, cy })) {
            setError('Lines cannot cross each other!');
            return prev;
          }
        }
      }
      return { ...prev, current: [...pts, { cx, cy }] };
    });
  }

  function roiClose(canvas) {
    setRoiState(prev => {
      const pts = prev.current;
      if (pts.length < 3) { setError('Need at least 3 points to close a zone'); return prev; }
      for (let i = 1; i < pts.length - 2; i++) {
        if (segmentsIntersect(pts[pts.length-1], pts[0], pts[i], pts[i+1])) {
          setError('Closing line would cross an existing edge!');
          return prev;
        }
      }
      const W = canvas?.width  ?? imgNatW;
      const H = canvas?.height ?? imgNatH;
      const color = ROI_COLORS[(prev.nextId - 1) % ROI_COLORS.length];
      return {
        ...prev,
        polygons: [...prev.polygons, {
          id: prev.nextId, color,
          points:    pts.map(p => toImgCoord(p.cx, p.cy, W, H, imgNatW, imgNatH)),
          canvasPts: [...pts],
        }],
        current: [],
        nextId: prev.nextId + 1,
      };
    });
  }

  function roiDelete(id) {
    setRoiState(prev => ({ ...prev, polygons: prev.polygons.filter(p => p.id !== id) }));
  }

  // ── People ──────────────────────────────────────────────────────────────────
  function peopleAddPoint(cx, cy, canvas) {
    const W  = canvas?.width  ?? imgNatW;
    const H  = canvas?.height ?? imgNatH;
    const ic = toImgCoord(cx, cy, W, H, imgNatW, imgNatH);
    setPeopleState(prev => ({
      ...prev,
      currentPts: [...prev.currentPts, { cx, cy, _ix: ic.x, _iy: ic.y }],
    }));
  }

  function peopleFinishLine() {
    setPeopleState(prev => {
      if (prev.currentPts.length < 2) { setError('Draw at least 2 points for a line'); return prev; }
      const lines = [...prev.lines];
      lines[prev.step] = { pts: prev.currentPts, color: PEOPLE_COLORS[prev.step] };
      return { ...prev, lines, currentPts: [], step: Math.min(prev.step + 1, 2) };
    });
  }

  // ── Unified handlers ────────────────────────────────────────────────────────
  function handleCanvasClick(e, pos, canvas) {
    if (e.ctrlKey) { handleFinish(canvas); return; }
    if (mode === 'roi') roiAddPoint(pos.cx, pos.cy);
    else peopleAddPoint(pos.cx, pos.cy, canvas);
    redraw();
  }

  function handleFinish(canvas) {
    if (mode === 'roi') roiClose(canvas);
    else peopleFinishLine();
    redraw();
  }

  function undoLast() {
    if (mode === 'roi') {
      setRoiState(prev => {
        if (prev.current.length > 0) return { ...prev, current: prev.current.slice(0,-1) };
        if (prev.polygons.length > 0) return { ...prev, polygons: prev.polygons.slice(0,-1) };
        return prev;
      });
    } else {
      setPeopleState(prev => {
        if (prev.currentPts.length > 0) return { ...prev, currentPts: prev.currentPts.slice(0,-1) };
        const lines = [...prev.lines];
        const idx = lines.length - 1;
        if (idx >= 0) { delete lines[idx]; return { ...prev, lines, step: idx }; }
        return prev;
      });
    }
    redraw();
  }

  function clearAll() {
    setRoiState(INITIAL_ROI);
    setPeopleState(INITIAL_PEOPLE);
    redraw();
  }

  useEffect(() => {
    function onKey(e) {
      if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
      if (e.key === 'Enter') handleFinish(null);
      if (e.key === 'Escape') {
        if (mode === 'roi') setRoiState(p => ({ ...p, current: [] }));
        else setPeopleState(p => ({ ...p, currentPts: [] }));
        redraw();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undoLast(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode]);

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: 'background.default',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      p: { xs: 0, sm: 2, lg: 3 }, pb: { xs: 4, sm: 4 },
    }}>

      {/* Header */}
      <Box sx={{
        width: '100%', maxWidth: 1280,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: { xs: 2, sm: 0 }, py: { xs: 1.5, sm: 0 }, mb: { xs: 0, sm: 2 },
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
            <Box sx={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '1.5px solid rgba(0,230,118,0.3)',
              animation: 'spin 8s linear infinite',
              '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
            }} />
            <Box sx={{
              position: 'absolute', inset: 6, borderRadius: '50%',
              bgcolor: 'primary.main',
              boxShadow: '0 0 10px #00e676, 0 0 20px #00e67644',
            }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Zone Drawing Tool
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
              ROI &amp; People Count Annotation
            </Typography>
          </Box>
        </Box>

        {!isMobile && (
          <Tooltip title="Enter = close/finish · Esc = cancel · Ctrl+Z = undo" placement="bottom">
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 0.75,
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 2, px: 1.25, py: 0.6, cursor: 'default',
              '&:hover': { borderColor: 'rgba(255,255,255,0.15)' },
            }}>
              <KeyboardIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>Shortcuts</Typography>
            </Box>
          </Tooltip>
        )}
      </Box>

      {/* Card */}
      <Paper elevation={0} sx={{
        width: '100%', maxWidth: 1280,
        border: { xs: 'none', sm: '1px solid' }, borderColor: 'divider',
        borderRadius: { xs: 0, sm: 3 }, overflow: 'hidden',
        bgcolor: 'background.paper',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 32px 80px rgba(0,0,0,0.5)',
      }}>

        {/* Toolbar */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: { xs: 1.5, sm: 2.5 }, py: 1.25,
          borderBottom: '1px solid', borderColor: 'divider',
          bgcolor: 'rgba(255,255,255,0.015)',
          flexWrap: 'wrap', gap: 1,
        }}>
          <Stack direction="row" spacing={0.75}>
            <ModeButton id="roi"    label="ROI Zones"    Icon={GestureIcon}            active={mode==='roi'}    onClick={setMode} />
            <ModeButton id="people" label="People Count" Icon={PeopleAltOutlinedIcon}  active={mode==='people'} onClick={setMode} />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Undo last point (Ctrl+Z)" placement="bottom">
              <Button size="small" variant="outlined"
                startIcon={<UndoIcon sx={{ fontSize:'15px !important' }} />}
                onClick={undoLast}
                sx={{
                  borderColor:'rgba(255,255,255,0.1)', color:'text.secondary',
                  '&:hover':{ borderColor:'secondary.main', color:'secondary.main', bgcolor:'rgba(68,138,255,0.08)' },
                }}>
                {!isMobile && 'Undo'}
              </Button>
            </Tooltip>
            <Tooltip title="Clear all drawings" placement="bottom">
              <Button size="small" variant="outlined"
                startIcon={<DeleteSweepIcon sx={{ fontSize:'15px !important' }} />}
                onClick={clearAll}
                sx={{
                  borderColor:'rgba(255,255,255,0.1)', color:'text.secondary',
                  '&:hover':{ borderColor:'error.main', color:'error.main', bgcolor:'rgba(255,82,82,0.08)' },
                }}>
                {!isMobile && 'Clear'}
              </Button>
            </Tooltip>
          </Stack>
        </Box>

        {/* Canvas */}
        <DrawCanvas
          imgRef={imgRef}
          imgNatW={imgNatW}
          imgNatH={imgNatH}
          mode={mode}
          roiState={roiState}
          peopleState={peopleState}
          onCanvasClick={handleCanvasClick}
          onRightClick={() => handleFinish(null)}
          onMouseMove={redraw}
        />

        {/* Bottom panels */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '320px 1fr' } }}>
          <Box sx={{
            p: { xs: 2, sm: 2.5 },
            borderRight:  { md: '1px solid' },
            borderBottom: { xs: '1px solid', md: 'none' },
            borderColor: 'divider',
          }}>
            <ImageSourcePanel
              imgNatW={imgNatW}
              imgNatH={imgNatH}
              onImageLoaded={handleImageLoaded}
              onDimensionChange={handleDimensionChange}
            />
          </Box>
          <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <HintsPanel mode={mode} />
            <OutputPanel
              mode={mode}
              roiState={roiState}
              peopleState={peopleState}
              onDeleteRoi={roiDelete}
            />
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={!!error} autoHideDuration={2800}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled"
          sx={{ borderRadius: 2, fontWeight: 500, fontSize: '0.82rem' }}
          onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}