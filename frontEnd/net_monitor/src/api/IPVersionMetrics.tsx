import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { APIError } from "../App";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

export type IPVersionDailyData = {
    date: string;
    ipv4Percentage: number;
    ipv6Percentage: number;
    totalFlows: number;
}

export type IPVersionBytesDailyData = {
    date: string;
    ipv4Bytes: number;
    ipv6Bytes: number;
    ipv4MB: number;
    ipv6MB: number;
    totalBytes: number;
    totalMB: number;
}

export function useIPVersionFlowsPercent(): UseQueryResult<IPVersionDailyData[], AxiosError<APIError>> {
    const { token } = useAuth();

    return useQuery<IPVersionDailyData[], AxiosError<APIError>>({
        queryKey: ['ipVersion', 'flowPercent'],
        queryFn: async () => {
            const response = await axios.get('http://localhost:9090/api/metrics/ipVersion/flowPercent', {
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

export function useIPVersionBytes(): UseQueryResult<IPVersionBytesDailyData[], AxiosError<APIError>> {
    const { token } = useAuth();

    return useQuery<IPVersionBytesDailyData[], AxiosError<APIError>>({
        queryKey: ['ipVersion', 'bandWidthUsage'],
        queryFn: async () => {
            const response = await axios.get('http://localhost:9090/api/metrics/ipVersion/bandWidthUsage', {
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