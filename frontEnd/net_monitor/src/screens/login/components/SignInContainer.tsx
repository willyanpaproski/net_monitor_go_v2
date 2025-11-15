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
import styles from './SignInContainer.module.css';
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
    // Clear error when user starts typing
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
      }}
    >
      <Card className={styles.loginCard} elevation={8}>
        {/* Header Section */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" width="100%">
          <Box className={styles.logoContainer}>
            <Logo fillColor="#00d4ff" width="180" height="60" />
            <Typography 
              variant="h4" 
              component="h1" 
              className={styles.title}
              gutterBottom
            >
              {t('loginPage.welcome') || 'Welcome Back'}
            </Typography>
            <Typography 
              variant="body2" 
              className={styles.subtitle}
            >
              {t('loginPage.subtitle') || 'Sign in to monitor your network'}
            </Typography>
          </Box>
          <LanguageSelector />
        </Stack>

        {/* Login Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          className={styles.form}
        >
          <FormControl fullWidth>
            <FormLabel htmlFor="email" className={styles.formLabel}>
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
              placeholder="Enter your email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email className={styles.inputIcon} />
                  </InputAdornment>
                ),
              }}
              className={styles.textField}
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel htmlFor="password" className={styles.formLabel}>
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
              placeholder="Enter your password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock className={styles.inputIcon} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                      className={styles.visibilityButton}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              className={styles.textField}
            />
          </FormControl>

          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loginMutation.isPending}
            className={styles.submitButton}
            size="large"
          >
            {loginMutation.isPending ? (
              <CircularProgress size={24} className={styles.loadingSpinner} />
            ) : (
              t('loginPage.signIn')
            )}
          </Button>
        </Box>

        {/* Footer */}
        <Typography variant="caption" className={styles.footerText}>
          {t('loginPage.footer') || 'Secure network monitoring system'}
        </Typography>
      </Card>
    </Stack>
  );
}