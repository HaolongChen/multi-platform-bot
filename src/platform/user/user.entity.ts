import { z } from "zod";

export const userEntity = z.object( {
  userId: z.uuidv4(),
  platform: z.enum([])
})