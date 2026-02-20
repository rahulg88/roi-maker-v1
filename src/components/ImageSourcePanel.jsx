import React, { useState, useEffect } from 'react';
import {
  Box, Typography, ToggleButton, ToggleButtonGroup,
  Button, TextField, Divider, FormControl,
  Select, MenuItem, Stack, InputAdornment, Collapse,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LinkIcon from '@mui/icons-material/Link';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import WidthFullIcon from '@mui/icons-material/WidthFull';
import HeightIcon from '@mui/icons-material/Height';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const WIDTH_PRESETS  = [640, 1280, 1920, 3840];
const HEIGHT_PRESETS = [360, 720, 1080, 2160];

function SectionLabel({ children }) {
  return (
    <Typography variant="overline" sx={{
      color: 'text.secondary', display: 'block', mb: 1,
      fontSize: '0.65rem', letterSpacing: '0.1em',
    }}>
      {children}
    </Typography>
  );
}

export default function ImageSourcePanel({ imgNatW, imgNatH, onImageLoaded, onDimensionChange }) {
  const [source,    setSource]    = useState('file');
  const [fileName,  setFileName]  = useState('');
  const [urlInput,  setUrlInput]  = useState('');
  const [customW,   setCustomW]   = useState(imgNatW);
  const [customH,   setCustomH]   = useState(imgNatH);

  // Sync input fields if parent changes dimensions (e.g. image loaded)
  useEffect(() => { setCustomW(imgNatW); }, [imgNatW]);
  useEffect(() => { setCustomH(imgNatH); }, [imgNatH]);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => loadSrc(ev.target.result);
    reader.readAsDataURL(file);
  }

  function loadSrc(src) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => onImageLoaded(img);
    img.onerror = () => alert('Could not load image.');
    img.src = src;
  }

  function applyW(val) {
    const n = parseInt(val) || 0;
    setCustomW(n);
    if (n > 0) onDimensionChange('width', n);
  }

  function applyH(val) {
    const n = parseInt(val) || 0;
    setCustomH(n);
    if (n > 0) onDimensionChange('height', n);
  }

  const widthMatch  = WIDTH_PRESETS.includes(customW)  ? customW  : 'custom';
  const heightMatch = HEIGHT_PRESETS.includes(customH) ? customH : 'custom';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

      {/* Source toggle */}
      <Box>
        <SectionLabel>Image Source</SectionLabel>
        <ToggleButtonGroup
          value={source} exclusive onChange={(_, v) => v && setSource(v)}
          size="small" fullWidth
          sx={{
            '& .MuiToggleButton-root': {
              borderColor: 'divider', color: 'text.secondary',
              fontSize: '0.78rem', fontWeight: 600,
              textTransform: 'none', py: 0.8, gap: 0.75,
              '&.Mui-selected': {
                color: 'primary.main',
                bgcolor: 'rgba(0,230,118,0.08)',
                borderColor: 'rgba(0,230,118,0.3)',
              },
              '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
            },
          }}
        >
          <ToggleButton value="file"><UploadFileIcon sx={{ fontSize: 16 }} /> File Upload</ToggleButton>
          <ToggleButton value="link"><LinkIcon sx={{ fontSize: 16 }} /> URL Link</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* File drop zone */}
      <Collapse in={source === 'file'}>
        <input type="file" id="fileInput" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        <Box
          onClick={() => document.getElementById('fileInput').click()}
          sx={{
            border: '1.5px dashed',
            borderColor: fileName ? 'primary.dark' : 'rgba(255,255,255,0.12)',
            borderRadius: 2, p: 2, textAlign: 'center', cursor: 'pointer',
            bgcolor: fileName ? 'rgba(0,230,118,0.04)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(0,230,118,0.06)' },
          }}
        >
          <ImageOutlinedIcon sx={{ fontSize: 28, color: fileName ? 'primary.main' : 'rgba(255,255,255,0.2)', mb: 0.5 }} />
          <Typography sx={{
            fontSize: '0.78rem', color: fileName ? 'primary.light' : 'text.secondary',
            fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', px: 1,
          }}>
            {fileName || 'Click to choose image'}
          </Typography>
          {!fileName && (
            <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', mt: 0.25 }}>
              JPG, PNG, WebP
            </Typography>
          )}
        </Box>
      </Collapse>

      {/* URL input */}
      <Collapse in={source === 'link'}>
        <Stack spacing={1}>
          <TextField
            size="small" fullWidth
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadSrc(urlInput.trim())}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </InputAdornment>
              ),
              style: { fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem' },
            }}
          />
          <Button variant="contained" color="primary" size="small" fullWidth
            onClick={() => urlInput.trim() && loadSrc(urlInput.trim())}
            sx={{ fontWeight: 700 }}>
            Load Image
          </Button>
        </Stack>
      </Collapse>

      <Divider sx={{ borderColor: 'divider' }} />

      {/* Dimensions */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <SectionLabel>Output Dimensions</SectionLabel>
          {/* Rescale note */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.5,
            bgcolor: 'rgba(255,171,64,0.08)',
            border: '1px solid rgba(255,171,64,0.2)',
            borderRadius: 1, px: 0.9, py: 0.2,
          }}>
            <SwapHorizIcon sx={{ fontSize: 11, color: '#ffab40' }} />
            <Typography sx={{ fontSize: '0.6rem', color: '#ffab40', fontWeight: 600 }}>
              auto-rescales coords
            </Typography>
          </Box>
        </Box>

        <Stack spacing={1.5}>
          {/* Width */}
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.75, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <WidthFullIcon sx={{ fontSize: 13 }} /> Width (px)
            </Typography>
            <Stack direction="row" spacing={1}>
              <FormControl size="small" sx={{ minWidth: 95 }}>
                <Select
                  value={widthMatch}
                  onChange={e => e.target.value !== 'custom' && applyW(e.target.value)}
                  sx={{ fontSize: '0.78rem' }}
                >
                  <MenuItem value="custom" disabled sx={{ fontSize: '0.78rem' }}>Custom</MenuItem>
                  {WIDTH_PRESETS.map(v => <MenuItem key={v} value={v} sx={{ fontSize: '0.78rem' }}>{v}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                size="small" type="number" value={customW} fullWidth
                onChange={e => applyW(e.target.value)}
                inputProps={{ min: 1 }}
                InputProps={{ style: { fontFamily: '"JetBrains Mono", monospace', fontSize: '0.82rem' } }}
              />
            </Stack>
          </Box>

          {/* Height */}
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.75, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <HeightIcon sx={{ fontSize: 13 }} /> Height (px)
            </Typography>
            <Stack direction="row" spacing={1}>
              <FormControl size="small" sx={{ minWidth: 95 }}>
                <Select
                  value={heightMatch}
                  onChange={e => e.target.value !== 'custom' && applyH(e.target.value)}
                  sx={{ fontSize: '0.78rem' }}
                >
                  <MenuItem value="custom" disabled sx={{ fontSize: '0.78rem' }}>Custom</MenuItem>
                  {HEIGHT_PRESETS.map(v => <MenuItem key={v} value={v} sx={{ fontSize: '0.78rem' }}>{v}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                size="small" type="number" value={customH} fullWidth
                onChange={e => applyH(e.target.value)}
                inputProps={{ min: 1 }}
                InputProps={{ style: { fontFamily: '"JetBrains Mono", monospace', fontSize: '0.82rem' } }}
              />
            </Stack>
          </Box>

          {/* Preset shortcuts */}
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.75, display: 'block' }}>
              Quick presets
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" gap={0.75}>
              {[
                { w: 640,  h: 360,  label: '640×360' },
                { w: 1280, h: 720,  label: '1280×720' },
                { w: 1920, h: 1080, label: '1920×1080' },
                { w: 3840, h: 2160, label: '4K' },
              ].map(preset => {
                const active = customW === preset.w && customH === preset.h;
                return (
                  <Box
                    key={preset.label}
                    onClick={() => { applyW(preset.w); applyH(preset.h); }}
                    sx={{
                      px: 1.25, py: 0.4, borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: active ? 'primary.main' : 'rgba(255,255,255,0.1)',
                      bgcolor: active ? 'rgba(0,230,118,0.1)' : 'transparent',
                      color: active ? 'primary.main' : 'text.secondary',
                      fontSize: '0.68rem', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s',
                      '&:hover': { borderColor: 'primary.dark', color: 'primary.light', bgcolor: 'rgba(0,230,118,0.06)' },
                    }}
                  >
                    {preset.label}
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Info note */}
          <Box sx={{
            display: 'flex', alignItems: 'flex-start', gap: 0.75,
            bgcolor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 1.5, p: 1.25,
          }}>
            <InfoOutlinedIcon sx={{ fontSize: 13, color: 'text.secondary', mt: '1px', flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', lineHeight: 1.6 }}>
              Changing dimensions automatically rescales all drawn coordinates proportionally.
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}