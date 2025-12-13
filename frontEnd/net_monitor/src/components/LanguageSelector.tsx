import { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { Language } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useLanguageContext } from '../contexts/LanguageContext';
import { useI18n } from '../hooks/usei18n';

export default function LanguageSelector() {
  const { t } = useI18n();
  const { currentLanguage, changeLanguage } = useLanguageContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const languages = [
    { code: 'pt', name: t('languageSelector.pt') || 'Português', flag: '🇧🇷' },
    { code: 'en', name: t('languageSelector.en') || 'English', flag: '🇺🇸' },
    { code: 'es', name: t('languageSelector.es') || 'Español', flag: '🇪🇸' },
  ];

  const currentLang = languages.find((lang) => lang.code === currentLanguage) || languages[0];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelect = (languageCode: string) => {
    changeLanguage(languageCode);
    handleClose();
  };

  return (
    <Box>
      <IconButton
        component={motion.button}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          padding: { xs: '6px 10px', sm: '8px 12px' },
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: '12px',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.4)',
          },
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: '1rem', sm: '1.1rem' },
            lineHeight: 1,
          }}
        >
          {currentLang.flag}
        </Typography>
        <Language
          sx={{
            fontSize: { xs: '1rem', sm: '1.1rem' },
            color: 'primary.main',
          }}
        />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              background: 'rgba(19, 23, 34, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              minWidth: '160px',
            },
          },
        }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageSelect(language.code)}
            selected={currentLang.code === language.code}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              padding: '10px 16px',
              color: 'text.primary',
              fontSize: { xs: '0.875rem', sm: '0.9rem' },
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'rgba(0, 212, 255, 0.1)',
              },
              '&.Mui-selected': {
                background: 'rgba(0, 212, 255, 0.15)',
                '&:hover': {
                  background: 'rgba(0, 212, 255, 0.2)',
                },
              },
            }}
          >
            <Typography sx={{ fontSize: '1.2rem', lineHeight: 1 }}>{language.flag}</Typography>
            <Typography sx={{ fontSize: 'inherit', fontWeight: currentLang.code === language.code ? 600 : 400 }}>
              {language.name}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}