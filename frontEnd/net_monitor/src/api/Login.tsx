import { useMutation } from '@tanstack/react-query';
import type { UseMutationResult } from "@tanstack/react-query";
import axios, { AxiosError } from 'axios';
import type { LoginFields } from '../schemas/Login';
import type { APIError } from '../App';
import { toast } from 'react-toastify';
import { useI18n } from '../hooks/usei18n';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export type LoginResponse = {
    access_token: string;
    refresh_token: string;
    expires_at: Date;
    user: {
        id: string;
        active: boolean;
        email: string;
        password: string;
        created_at: Date;
        updated_at: Date;
    }
}

export function useLogin(): UseMutationResult<LoginResponse, unknown, LoginFields, unknown> {
    const { t } = useI18n();
    const auth = useAuth();
    const navigate = useNavigate();

    return useMutation<LoginResponse, AxiosError<APIError>, LoginFields>({
        mutationFn: async (data) => {
            const response = await axios.post('http://localhost:9090/api/auth/login', data);
            return response.data;
        },
        onSuccess: (data) => {
            auth.login(data.access_token, JSON.stringify(data.user));
            navigate('/dashboard');
        },
        onError: (error: AxiosError<APIError>) => {
            switch (error.response?.data.error.code) {
                case "INVALID_PASSWORD":
                    toast.error(t('loginPage.errors.invalidPassword'));
                    break
                case "USER_NOT_FOUND":
                    toast.error(t('loginPage.errors.userNotFound'));
                    break
                case "INACTIVE_USER":
                    toast.error(t('loginPage.errors.userInactive'));
                    break
                default:
                    toast.error('loginPage.errors.loginError');
            }
        }
    });
}
