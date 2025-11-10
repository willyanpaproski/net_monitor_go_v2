import z from "zod";
import { useI18n } from "../hooks/usei18n";

export function useRouterSchema() {
    const { t } = useI18n();

    const ipRegex =
        /^(25[0-5]|2[0-4][0-9]|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4][0-9]|1\d{2}|[1-9]?\d)){3}$/;

    return z.object({
        active: z.boolean(),
        integration: z.enum([
            "mikrotik",
            "huawei",
            "cisco"
        ]),
        name: z.string(),
        description: z.string(),
        accessUser: z.string(),
        accessPassword: z.string().min(6, t('routers.schema.passwordLength')),
        ipAddress: z.string().regex(ipRegex, t('routers.schema.invalidIpAddress')),
        snmpCommunity: z.string(),
        snmpPort: z.string()
    });
}