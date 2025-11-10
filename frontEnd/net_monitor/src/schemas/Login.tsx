import { z } from 'zod';
import { useI18n } from '../hooks/usei18n';

export function useLoginSchema() {
  const { t } = useI18n();
  
  return z.object({
    email: z.string().email(t('loginPage.schema.invalidEmail')),
    password: z.string().min(6, t('loginPage.schema.passwordLength'))
  });
}

export type LoginFields = {
  email: string;
  password: string;
};