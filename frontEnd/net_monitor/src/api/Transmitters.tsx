import { useMutation, useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { APIError } from "../App";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { useI18n } from "../hooks/usei18n";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export type Transmitter = {
    id: string;
    accessPassword: string;
    accessUser: string;
    active: boolean;
    description: string;
    integration: "huawei" | "datacom" | "zte" | "think" | "tplinkp7000";
    ipAddress: string;
    name: string;
    snmpCommunity: string;
    snmpPort: string;
    updated_at: Date;
    created_at: Date;
}

export type CreateTransmitterData = Omit<Transmitter, 'id' | 'created_at' | 'updated_at'> & {
    successEvent?: () => void;
}

export type EditTransmitterData = Transmitter & {
    successEvent?: () => void;
}

export function useTransmitters(): UseQueryResult<Transmitter[], AxiosError<APIError>> {
    const { token } = useAuth();

    return useQuery<Transmitter[], AxiosError<APIError>>({
        queryKey: ['transmitters'],
        queryFn: async () => {
            const response = await axios.get('http://localhost:9090/api/transmitters', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data
        },
        staleTime: 1000 * 60 * 5,
        retry: 1
    });
}

export function useTransmitter(transmitterId: string): UseQueryResult<Transmitter, AxiosError<APIError>> {
    const { token } = useAuth();

    return useQuery<Transmitter, AxiosError<APIError>>({
        queryKey: ['transmitter', transmitterId],
        queryFn: async () => {
            const response = await axios.get(`http://localhost:9090/api/transmitters/${transmitterId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
        retry: 1,
        enabled: !!transmitterId
    });
}

export function useDeleteTransmitter() {
    const queryClient = useQueryClient();
    const { token } = useAuth();

    return useMutation<void, AxiosError<APIError>, string>({
        mutationFn: async (transmitterId: string) => {
            await axios.delete(`http://localhost:9090/api/transmitters/${transmitterId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transmitters"] });
        }
    });
}

export function useCreateTransmitter() {
    const { t } = useI18n();
    const { token } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation<Partial<Transmitter>, AxiosError<APIError>, CreateTransmitterData>({
        mutationFn: async (data: CreateTransmitterData) => {
            const response = await axios.post('http://localhost:9090/api/transmitters', data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["transmitters"] });
            toast.success(t('transmitters.createForm.successMessages.created'));
            if (variables.successEvent) {
                variables.successEvent();
            }
            navigate('/transmitters');
        },
        onError: (error: AxiosError<APIError>) => {
            if (error.response?.data.error.code === "DUPLICATED_TRANSMITTER_NAME") {
                toast.error(t('transmitters.createForm.errors.duplicatedTransmitterName'));
                return;
            }
            toast.error(t('transmitters.createForm.errors.error'));
        }
    });
}

export function useEditTransmitter() {
    const { t } = useI18n();
    const { token } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation<Partial<Transmitter>, AxiosError<APIError>, EditTransmitterData>({
        mutationFn: async (data: EditTransmitterData) => {
            const response = await axios.patch(`http://localhost:9090/api/transmitters/${data.id}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["transmitters"] });
            toast.success(t('transmitters.createForm.successMessages.saved'));
            if (variables.successEvent) variables.successEvent;
            navigate('/transmitters');
        },
        onError: (error: AxiosError<APIError>) => {
            if (error.response?.data.error.code === "DUPLICATED_TRANSMITTER_NAME") {
                toast.error(t('transmitters.createForm.errors.duplicatedTransmitterName'));
                return;
            }
            toast.error(t('transmitters.createForm.errors.errorSaving'));
        }
    });
}