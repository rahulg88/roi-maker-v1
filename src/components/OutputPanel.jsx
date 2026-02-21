import React, { useState } from 'react';
import {
  Box, Typography, Button, Stack, Divider,
  IconButton, Tooltip, ToggleButtonGroup, ToggleButton, Chip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DataObjectIcon from '@mui/icons-material/DataObject';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import CallMergeIcon from '@mui/icons-material/CallMerge';
import { PEOPLE_LABELS, PEOPLE_COLORS } from '../utils/drawUtils';

export default function OutputPanel({ mode, roiState, peopleState, onDeleteRoi }) {
  const [copied,     setCopied]     = useState(false);
  const [roiFmt,     setRoiFmt]     = useState('json');
  const [peopleFmt,  setPeopleFmt]  = useState('standard');

  const output = buildOutput(mode, roiState, peopleState, roiFmt, peopleFmt);

  function copyOutput() {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const toggleSx = {
    '& .MuiToggleButton-root': {
      border: '1px solid rgba(255,255,255,0.1)',
      color: 'text.secondary',
      fontSize: '0.68rem',
      fontWeight: 600,
      textTransform: 'none',
      px: 1.25, py: 0.4,
      gap: 0.5,
      lineHeight: 1.5,
      '&.Mui-selected': {
        color: 'primary.main',
        bgcolor: 'rgba(0,230,118,0.1)',
        borderColor: 'rgba(0,230,118,0.3)',
      },
      '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
    },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>

      {/* ── ROI zone list ───────────────────────────────────────────── */}
      {mode === 'roi' && roiState.polygons.length > 0 && (
        <Box>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.1em', fontSize: '0.65rem' }}>
            Zones ({roiState.polygons.length})
          </Typography>
          <Stack spacing={0.75} sx={{ mt: 1, maxHeight: 140, overflowY: 'auto' }}>
            {roiState.polygons.map(poly => (
              <Box key={poly.id} sx={{
                display: 'flex', alignItems: 'center', gap: 1.25,
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid', borderColor: 'divider',
                borderRadius: 2, px: 1.5, py: 1,
                transition: 'all 0.15s',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: poly.color + '44' },
              }}>
                <Box sx={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  bgcolor: poly.color, boxShadow: `0 0 8px ${poly.color}88`,
                }} />
                <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', flex: 1 }}>ROI {poly.id}</Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', fontFamily: '"JetBrains Mono", monospace' }}>
                  {poly.points.length} pts
                </Typography>
                <Tooltip title="Delete zone" placement="top">
                  <IconButton size="small" onClick={() => onDeleteRoi(poly.id)} sx={{
                    color: 'rgba(255,82,82,0.5)', p: 0.5,
                    '&:hover': { color: 'error.main', bgcolor: 'rgba(255,82,82,0.1)' },
                  }}>
                    <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
          </Stack>
          <Divider sx={{ mt: 2, borderColor: 'divider' }} />
        </Box>
      )}

      {/* ── People step indicator ───────────────────────────────────── */}
      {mode === 'people' && (
        <Box>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.1em', fontSize: '0.65rem' }}>
            Progress
          </Typography>
          <Stack spacing={0.75} sx={{ mt: 1 }}>
            {PEOPLE_LABELS.map((label, i) => {
              const done   = !!peopleState.lines[i];
              const active = !done && peopleState.step === i;
              const color  = PEOPLE_COLORS[i];
              return (
                <Box key={i} sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  px: 1.5, py: 1, borderRadius: 2,
                  bgcolor: done ? color + '0f' : active ? color + '08' : 'transparent',
                  border: '1px solid',
                  borderColor: done ? color + '40' : active ? color + '25' : 'divider',
                  transition: 'all 0.2s',
                }}>
                  <Box sx={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: done ? color : active ? color + '22' : 'rgba(255,255,255,0.05)',
                    border: `1.5px solid ${done ? color : active ? color : 'rgba(255,255,255,0.1)'}`,
                    fontSize: '0.65rem', fontWeight: 700,
                    color: done ? '#000' : active ? color : 'text.secondary',
                  }}>
                    {done ? <CheckIcon sx={{ fontSize: 11 }} /> : i + 1}
                  </Box>
                  <Typography sx={{
                    fontSize: '0.78rem', fontWeight: active || done ? 600 : 400,
                    color: done ? color : active ? color : 'text.secondary',
                    flex: 1,
                  }}>
                    {label}
                  </Typography>
                  {done && (
                    <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', fontFamily: '"JetBrains Mono", monospace' }}>
                      {peopleState.lines[i].pts.length} pts
                    </Typography>
                  )}
                  {active && (
                    <Box sx={{
                      width: 6, height: 6, borderRadius: '50%', bgcolor: color,
                      animation: 'pulse 1.2s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%,100%': { opacity: 1, transform: 'scale(1)' },
                        '50%': { opacity: 0.4, transform: 'scale(0.7)' },
                      },
                    }} />
                  )}
                </Box>
              );
            })}
          </Stack>
          <Divider sx={{ mt: 2, borderColor: 'divider' }} />
        </Box>
      )}

      {/* ── Output section ──────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, flex: 1 }}>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.1em', fontSize: '0.65rem' }}>
            Output Coordinates
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">

            {/* ROI format toggle */}
            {mode === 'roi' && (
              <ToggleButtonGroup value={roiFmt} exclusive onChange={(_, v) => v && setRoiFmt(v)} size="small" sx={toggleSx}>
                <ToggleButton value="json">
                  <DataObjectIcon sx={{ fontSize: 13 }} /> JSON
                </ToggleButton>
                <ToggleButton value="flat">
                  <FormatListNumberedIcon sx={{ fontSize: 13 }} /> Flat Int
                </ToggleButton>
              </ToggleButtonGroup>
            )}

            {/* People format toggle */}
            {mode === 'people' && (
              <ToggleButtonGroup value={peopleFmt} exclusive onChange={(_, v) => v && setPeopleFmt(v)} size="small" sx={toggleSx}>
                <ToggleButton value="standard">
                  <FormatListNumberedIcon sx={{ fontSize: 13 }} /> Standard
                </ToggleButton>
                <ToggleButton value="combined">
                  <CallMergeIcon sx={{ fontSize: 13 }} /> Combined
                </ToggleButton>
              </ToggleButtonGroup>
            )}

            {/* Copy */}
            <Button
              size="small"
              variant={copied ? 'contained' : 'outlined'}
              color={copied ? 'success' : 'inherit'}
              startIcon={copied
                ? <CheckIcon sx={{ fontSize: '13px !important' }} />
                : <ContentCopyIcon sx={{ fontSize: '13px !important' }} />}
              onClick={copyOutput}
              disabled={!output}
              sx={{
                fontSize: '0.72rem', py: 0.4, px: 1.5,
                borderColor: copied ? 'success.main' : 'rgba(255,255,255,0.1)',
                color: copied ? 'success.main' : 'text.secondary',
                '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
                '&:disabled': { opacity: 0.35 },
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </Stack>
        </Box>

        {/* Format description badge */}
        {output && (
          <FormatBadge mode={mode} roiFmt={roiFmt} peopleFmt={peopleFmt} />
        )}

        {/* Output box — fontSize bumped from 0.69rem → 0.85rem */}
        <Box sx={{
          bgcolor: '#05080f',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 2, p: 1.75,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.85rem',                          // ← increased
          color: output ? '#69f0ae' : 'rgba(255,255,255,0.15)',
          minHeight: 80,
          maxHeight: 220,
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          lineHeight: 1.9,
          flex: 1,
          position: 'relative',
        }}>
          {output || '// draw on canvas to see coordinates'}
          <Box sx={{
            position: 'absolute', inset: 0, borderRadius: 2,
            background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)',
            pointerEvents: 'none',
          }} />
        </Box>
      </Box>
    </Box>
  );
}

// ── Format description badge ─────────────────────────────────────────────────

function FormatBadge({ mode, roiFmt, peopleFmt }) {
  let color, bg, border, label;
  if (mode === 'roi') {
    if (roiFmt === 'json') {
      color = '#82b1ff'; bg = 'rgba(68,138,255,0.1)'; border = 'rgba(68,138,255,0.25)';
      label = '{"x": int, "y": int} per point';
    } else {
      color = '#ffab40'; bg = 'rgba(255,171,64,0.1)'; border = 'rgba(255,171,64,0.25)';
      label = '[x; y; x; y; …] flat integers';          // ← updated label
    }
  } else {
    if (peopleFmt === 'standard') {
      color = '#82b1ff'; bg = 'rgba(68,138,255,0.1)'; border = 'rgba(68,138,255,0.25)';
      label = '3 separate lines: Main + Entry + Exit';
    } else {
      color = '#e040fb'; bg = 'rgba(224,64,251,0.1)'; border = 'rgba(224,64,251,0.25)';
      label = 'Combined: Entry & Exit each merged with Main endpoints';
    }
  }
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start',
      bgcolor: bg, border: '1px solid', borderColor: border,
      borderRadius: 1, px: 1, py: 0.25,
      fontSize: '0.65rem', fontWeight: 600, color,
    }}>
      {label}
    </Box>
  );
}

// ── Output builders ──────────────────────────────────────────────────────────

function buildOutput(mode, roiState, peopleState, roiFmt, peopleFmt) {
  if (mode === 'roi') {
    if (!roiState.polygons.length) return '';
    return roiState.polygons.map(poly => {
      if (roiFmt === 'flat') {
        const nums = poly.points.flatMap(p => [Math.round(p.x), Math.round(p.y)]);
        return '[' + nums.join(';') + ']';              // ← semicolon separator
      }
      return '[' + poly.points.map(p => `{"x":${Math.round(p.x)},"y":${Math.round(p.y)}}`).join(',') + ']';
    }).join('\n');
  }

  // People count
  const { lines } = peopleState;
  if (!lines.some(Boolean)) return '';

  if (peopleFmt === 'standard') {
    return lines.map((line, i) => {
      if (!line) return null;
      const pts = line.pts.map(p => `${Math.round(p._ix)};${Math.round(p._iy)}`).join(';');
      return `${['line-crossing-Main','line-crossing-Entry','line-crossing-Exit'][i]}=${pts}`;
    }).filter(Boolean).join('\n');
  }

  const mainLine  = lines[0];
  const entryLine = lines[1];
  const exitLine  = lines[2];

  if (!mainLine || !entryLine || !exitLine) {
    const parts = lines.map((line, i) => {
      if (!line) return null;
      const pts = line.pts.map(p => `${Math.round(p._ix)};${Math.round(p._iy)}`).join(';');
      return `${['line-crossing-Main','line-crossing-Entry','line-crossing-Exit'][i]}=${pts}`;
    }).filter(Boolean);
    return parts.join('\n') + '\n\n// Draw all 3 lines for combined format';
  }

  const mainPts  = mainLine.pts.map(p  => `${Math.round(p._ix)};${Math.round(p._iy)}`);
  const entryPts = entryLine.pts.map(p => `${Math.round(p._ix)};${Math.round(p._iy)}`);
  const exitPts  = exitLine.pts.map(p  => `${Math.round(p._ix)};${Math.round(p._iy)}`);

  const mainPtsReversed = [...mainPts].reverse();

  const entryCombined = [...entryPts, ...mainPts].join(';');
  const exitCombined  = [...exitPts,  ...mainPtsReversed].join(';');

  return `line-crossing-Entry=${entryCombined}\nline-crossing-Exit=${exitCombined}`;
}