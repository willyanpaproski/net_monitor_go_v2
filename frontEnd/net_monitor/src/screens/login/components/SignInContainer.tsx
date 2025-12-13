import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Logo } from '../../../assets/logo';
import LanguageSelector from '../../../components/LanguageSelector';
import { useI18n } from '../../../hooks/usei18n';
import { useLogin } from '../../../api/Login';
import { useLoginSchema } from '../../../schemas/Login';
import type { LoginFields } from '../../../schemas/Login';

export default function SignInContainer() {
  const { t } = useI18n();
  const loginMutation = useLogin();
  const loginSchema = useLoginSchema();

  const [formData, setFormData] = useState<LoginFields>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<LoginFields>>({});
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginFields]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = loginSchema.safeParse(formData);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setErrors({});
    loginMutation.mutate(formData);
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems={{ xs: 'center', md: 'flex-end' }}
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Card
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        elevation={8}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: { 
            xs: 'min(95vw, 400px)', 
            sm: 'min(90vw, 440px)', 
            md: '440px' 
          },
          minWidth: { 
            xs: 'min(280px, 85vw)', 
            sm: '320px' 
          },
          padding: { 
            xs: 'clamp(16px, 4vw, 20px) clamp(12px, 3vw, 16px)', 
            sm: 'clamp(24px, 4vw, 32px) clamp(20px, 3vw, 24px)', 
            md: '40px 32px' 
          },
          gap: { 
            xs: 'clamp(16px, 3vw, 20px)', 
            sm: 'clamp(24px, 3vw, 28px)', 
            md: '32px' 
          },
          background: 'rgba(19, 23, 34, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: { xs: '16px', sm: '20px' },
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 212, 255, 0.1)',
          margin: { xs: '0 auto', md: '20px' },
          marginRight: { md: 'clamp(20px, 10vw, 10%)' },
          overflow: 'hidden',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" width="100%">
          <Box sx={{ textAlign: 'left', mb: { xs: 0.5, sm: 1 } }}>
            <Box sx={{ 
              mb: { xs: 1.5, sm: 2 }, 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 0.5, sm: 1 },
              flexWrap: 'wrap'
            }}>
              <Box sx={{ 
                width: { xs: '200px', sm: '200px', md: '200px' },
                height: 'auto',
                flexShrink: 0
              }}>
                <Logo fillColor="#00d4ff" width="100%" height="auto" />
              </Box>
            </Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 700,
                mt: { xs: 1, sm: 1.5, md: 2 },
                mb: { xs: 0.5, sm: 0.75, md: 1 },
                fontSize: 'clamp(1.25rem, 4vw, 2rem)',
                lineHeight: 1.2,
              }}
            >
              {t('loginPage.welcome') || 'Welcome Back'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 400,
                fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                lineHeight: 1.4,
              }}
            >
              {t('loginPage.subtitle') || 'Sign in to monitor your network'}
            </Typography>
          </Box>
          <LanguageSelector />
        </Stack>

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: { xs: '16px', sm: '20px', md: '24px' },
          }}
        >
          <FormControl fullWidth>
            <FormLabel
              htmlFor="email"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                mb: { xs: 0.5, sm: 0.75, md: 1 },
                fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
              }}
            >
              {t('loginPage.email')}
            </FormLabel>
            <TextField
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
              fullWidth
              error={!!errors.email}
              helperText={errors.email}
              size="medium"
              placeholder={t('loginPage.emailPlaceholder')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'primary.main', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: { xs: '10px', sm: '12px' },
                  color: 'white',
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0, 212, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: '2px',
                  },
                },
                '& .MuiInputBase-input': {
                  padding: 'clamp(10px, 2vw, 12px) clamp(12px, 2vw, 14px)',
                  '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                  },
                },
                '& .MuiFormHelperText-root': {
                  fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)',
                  marginLeft: 0,
                },
              }}
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel
              htmlFor="password"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                mb: { xs: 0.5, sm: 0.75, md: 1 },
                fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
              }}
            >
              {t('loginPage.password')}
            </FormLabel>
            <TextField
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              fullWidth
              error={!!errors.password}
              helperText={errors.password}
              size="medium"
              placeholder={t('loginPage.passwordPlaceholder')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'primary.main', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        padding: { xs: '6px', sm: '8px' },
                        '&:hover': {
                          color: 'primary.main',
                          background: 'rgba(0, 212, 255, 0.1)',
                        },
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: { xs: '10px', sm: '12px' },
                  color: 'white',
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0, 212, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: '2px',
                  },
                },
                '& .MuiInputBase-input': {
                  padding: 'clamp(10px, 2vw, 12px) clamp(12px, 2vw, 14px)',
                  '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                  },
                },
                '& .MuiFormHelperText-root': {
                  fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)',
                  marginLeft: 0,
                },
              }}
            />
          </FormControl>

          <Button
            component={motion.button}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            fullWidth
            variant="contained"
            type="submit"
            disabled={loginMutation.isPending}
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
              color: 'white',
              padding: 'clamp(11px, 2vw, 14px)',
              borderRadius: { xs: '10px', sm: '12px' },
              fontWeight: 700,
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              textTransform: 'none',
              mt: { xs: 0.5, sm: 1 },
              boxShadow: '0 8px 25px -8px rgba(0, 212, 255, 0.5), 0 4px 15px -4px rgba(0, 212, 255, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 35px -8px rgba(0, 212, 255, 0.7), 0 6px 20px -4px rgba(0, 212, 255, 0.4)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.5)',
                transform: 'none',
                boxShadow: 'none',
              },
            }}
          >
            {loginMutation.isPending ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              t('loginPage.signIn')
            )}
          </Button>
        </Box>

        <Typography
          variant="caption"
          sx={{
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.5)',
            mt: { xs: 1, sm: 1.5, md: 2 },
            fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
            lineHeight: 1.3,
          }}
        >
          {t('loginPage.footer') || 'Secure network monitoring system'}
        </Typography>
      </Card>
    </Stack>
  );
}