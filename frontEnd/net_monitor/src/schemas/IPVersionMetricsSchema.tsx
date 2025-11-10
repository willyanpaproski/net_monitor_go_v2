import z from "zod";

export const ipVersionDailyDataSchema = z.object({
    date: z.string(),
    ipv4Percentage: z.number(),
    ipv6Percentage: z.number(),
    totalFlows: z.number()
});

export const ipVersionBytesDailyDataSchema = z.object({
    date: z.string(),
    ipv4Bytes: z.number(),
    ipv6Bytes: z.number(),
    ipv4MB: z.number(),
    ipv6MB: z.number(),
    totalBytes: z.number(),
    totalMB: z.number()
});

export const ipVersionFlowsPercentSchema = z.array(ipVersionDailyDataSchema);
export const ipVersionBytesSchema = z.array(ipVersionBytesDailyDataSchema);