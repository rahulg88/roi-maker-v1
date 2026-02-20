import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import GestureIcon from '@mui/icons-material/Gesture';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

function KBD({ children }) {
  return (
    <Box component="kbd" sx={{
      display: 'inline-block',
      bgcolor: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderBottomWidth: '2px',
      borderRadius: '4px',
      px: 0.75,
      py: 0.1,
      fontFamily: '"DM Mono", monospace',
      fontSize: '0.68rem',
      color: 'text.primary',
      lineHeight: 1.6,
    }}>
      {children}
    </Box>
  );
}

function LineTag({ children, color }) {
  return (
    <Box component="span" sx={{
      display: 'inline-block',
      bgcolor: color + '22',
      border: `1px solid ${color}44`,
      color: color,
      borderRadius: '4px',
      px: 0.75,
      fontSize: '0.68rem',
      fontWeight: 700,
    }}>
      {children}
    </Box>
  );
}

export default function HintsPanel({ mode }) {
  return (
    <Box>
      {mode === 'roi' ? (
        <Paper elevation={0} sx={{
          bgcolor: 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 2,
          p: 1.5,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
            <GestureIcon sx={{ fontSize: 14, color: 'primary.main' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.72rem' }}>
              ROI Zone Mode
            </Typography>
          </Box>
          <Typography variant="caption" component="div" sx={{ color: 'text.secondary', lineHeight: 2 }}>
            <strong>Left Click</strong> to place polygon points<br />
            <strong>Right Click</strong> or <KBD>Enter</KBD> to close & save zone<br />
            <KBD>Esc</KBD> to cancel current zone • Lines cannot cross<br />
            Multiple ROIs supported — each in a unique color
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{
          bgcolor: 'rgba(59,130,246,0.06)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 2,
          p: 1.5,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
            <PeopleAltIcon sx={{ fontSize: 14, color: 'secondary.main' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'secondary.main', fontSize: '0.72rem' }}>
              People Count Mode
            </Typography>
          </Box>
          <Typography variant="caption" component="div" sx={{ color: 'text.secondary', lineHeight: 2 }}>
            Draw <strong>3 lines</strong> in sequence:<br />
            1.&nbsp;<LineTag color="#22c55e">Main Line</LineTag>&nbsp; — straight crossing boundary<br />
            2.&nbsp;<LineTag color="#3b82f6">Entry Direction</LineTag>&nbsp; — people entering<br />
            3.&nbsp;<LineTag color="#f97316">Exit Direction</LineTag>&nbsp; — people exiting<br />
            <strong>Right Click</strong> or <KBD>Enter</KBD> to finish each line
          </Typography>
        </Paper>
      )}
    </Box>
  );
}