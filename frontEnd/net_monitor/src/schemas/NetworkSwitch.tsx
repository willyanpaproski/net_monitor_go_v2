import z from "zod";
import { useI18n } from "../hooks/usei18n";

export function useNetworkSwitchSchema() {
    const { t } = useI18n();

    const ipRegex =
        /^(25[0-5]|2[0-4][0-9]|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4][0-9]|1\d{2}|[1-9]?\d)){3}$/;

    return z.object({
        active: z.boolean(),
        integration: z.enum([
            "ciscoCatalist",
            "huawei"
        ]),
        name: z.string(),
        description: z.string(),
        accessUser: z.string(),
        accessPassword: z.string().min(6, t('switches.schema.passwordLength')),
        ipAddress: z.string().regex(ipRegex, t('switches.schema.invalidIpAddress')),
        snmpCommunity: z.string(),
        snmpPort: z.string()
    });
}