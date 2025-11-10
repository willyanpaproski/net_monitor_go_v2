import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = loginSchema.safeParse(formData);

    if (!parsed.success) {
      const fieldErrors =  parsed.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setErrors({});
    loginMutation.mutate(formData);
  }

  return (
    <Stack
      direction="column"
      justifyContent="space-between"
      className={styles.signInContainer}
    >
      <Card className={styles.loginCard} variant="outlined">
        <Stack>
          <LanguageSelector />
        </Stack>
        <Stack>
          <Logo fillColor="#fff" width="300" height="200" />
        </Stack>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}
        >
          <FormControl>
            <FormLabel htmlFor="email">{t('loginPage.email')}</FormLabel>
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
              size='small'
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="password">{t('loginPage.password')}</FormLabel>
            <TextField
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              fullWidth
              error={!!errors.password}
              helperText={errors.password}
              size='small'
            />
          </FormControl>
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loginMutation.isPending}
          >
            {t('loginPage.signIn')}
          </Button>
        </Box>
      </Card>
    </Stack>
  );
}
