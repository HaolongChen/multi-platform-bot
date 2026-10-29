import { z } from 'zod';

export const envSchema = z.object({
	PORT: z.number().default(3000),
	WECHAT_MSG_PORT: z.number().nonoptional(),
	WECHAT_CMD_PORT: z.number().nonoptional(),
	WECHAT_HOST: z.string().nonoptional(),
	BLUEBUBBLES_HOST: z.ipv4().nonoptional(),
	BLUEBUBBLES_PORT: z.number().nonoptional(),
	BLUEBUBBLES_PASSWORD: z.string().nonoptional(),
});
