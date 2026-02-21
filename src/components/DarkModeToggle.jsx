import React from 'react';
import { Button, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

export default function DarkModeToggle({ darkMode, onToggle }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Tooltip
      title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      placement="bottom"
    >
      <Button
        size="small"
        onClick={onToggle}
        startIcon={
          darkMode
            ? <LightModeIcon sx={{ fontSize: '15px !important' }} />
            : <DarkModeIcon  sx={{ fontSize: '15px !important' }} />
        }
        sx={{
          px: 1.5, py: 0.6, borderRadius: 2,
          fontSize: '0.72rem', fontWeight: 600,
          border: '1px solid',
          color: darkMode ? 'warning.light' : 'text.secondary',
          borderColor: darkMode ? 'rgba(255,183,77,0.35)' : 'rgba(0,0,0,0.15)',
          bgcolor: darkMode ? 'rgba(255,183,77,0.08)' : 'transparent',
          transition: 'all 0.18s',
          '&:hover': {
            bgcolor: darkMode ? 'rgba(255,183,77,0.14)' : 'rgba(0,0,0,0.04)',
            borderColor: darkMode ? 'rgba(255,183,77,0.5)' : 'rgba(0,0,0,0.25)',
          },
        }}
      >
        {!isMobile && (darkMode ? 'Light Mode' : 'Dark Mode')}
      </Button>
    </Tooltip>
  );
}