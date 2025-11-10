import { useMutation, useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { APIError } from "../App";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { useI18n } from "../hooks/usei18n";
import { useNavigate } from "react-router-dom";

export type Router = {
    id: string;
    accessPassword: string;
    accessUser: string;
    active: boolean;
    description: string;
    integration: "mikrotik" | "huawei" | "cisco";
    ipAddress: string;
    name: string;
    snmpCommunity: string;
    snmpPort: string;
    memoryUsageToday: {
        timestamp: Date,
        value: number
    }[];
    monthAvarageMemoryUsage: {
        timestamp: Date,
        value: number
    }[];
    cpuUsageToday: {
        timestamp: Date,
        value: number
    }[];
    monthAverageCpuUsage: {
        timestamp: Date,
        value: number
    }[];
    diskUsageToday: {
        timestamp: Date,
        value: number
    }[];
    monthAverageDiskUsage: {
        timestamp: Date,
        value: number
    }[];
    updated_at: Date;
    created_at: Date;
}

type CreateRouterData = Omit<Router, 'id' | 'created_at' | 'updated_at'> & {
    successEvent?: () => void;
}

type EditRouterData = Router & {
    successEvent?: () => void;
}

export function useRouters(): UseQueryResult<Router[], AxiosError<APIError>> {
    const { token } = useAuth();

    return useQuery<Router[], AxiosError<APIError>>({
        queryKey: ['routers'],
        queryFn: async () => {
            const response = await axios.get('http://localhost:9090/api/routers', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
        retry: 1
    });
}

export function useRouter(routerId: string): UseQueryResult<Router, AxiosError<APIError>> {
    const { token } = useAuth();

    return useQuery<Router, AxiosError<APIError>>({
        queryKey: ['router', routerId],
        queryFn: async () => {
            const response = await axios.get(`http://localhost:9090/api/routers/${routerId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
        retry: 1,
        enabled: !!routerId
    });
}

export function useDeleteRouter() {
    const queryClient = useQueryClient();
    const { token } = useAuth();

    return useMutation<void, AxiosError<APIError>, string>({
        mutationFn: async (routerId: string) => {
            await axios.delete(`http://localhost:9090/api/routers/${routerId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["routers"] });
        }
    });
}

export function useCreateRouter() {
    const { t } = useI18n();
    const { token } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation<CreateRouterData, AxiosError<APIError>, CreateRouterData>({
        mutationFn: async (data: CreateRouterData) => {
            const response = await axios.post('http://localhost:9090/api/routers', data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["routers"] });
            toast.success(t('routers.createForm.successMessages.created'));
            if (variables.successEvent) variables.successEvent();
            navigate('/routers');
        },
        onError: (error: AxiosError<APIError>) => {
            if (error.response?.data.error.code === "DUPLICATED_ROUTER_NAME") {
                toast.error(t('routers.createForm.errors.duplicatedRouterName'));
                return;
            }
            toast.error(t('routers.createForm.errors.error'));
        }
    });
}

export function useEditRouter() {
    const { t } = useI18n();
    const { token } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation<Partial<Router>, AxiosError<APIError>, EditRouterData>({
        mutationFn: async (data: EditRouterData) => {
            const response = await axios.patch(`http://localhost:9090/api/routers/${data.id}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["routers"] });
            toast.success(t('routers.createForm.successMessages.saved'));
            if (variables.successEvent) {
                variables.successEvent();
            }
            navigate('/routers');
        },
        onError: (error: AxiosError<APIError>) => {
            if (error.response?.data.error.code === "DUPLICATED_ROUTER_NAME") {
                toast.error(t('routers.createForm.errors.duplicatedRouterName'));
                return
            }
            toast.error(t('routers.createForm.errors.errorSaving'));
        }
    });
}