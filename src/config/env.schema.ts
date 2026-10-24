import { z } from 'zod';

export const envSchema = z.object({
	PORT: z.number().default(3000),
	REMOTE_PORT: z.number().nonoptional(),
	REMOTE_HOST: z.ipv4().nonoptional(),
});
