import { z } from "zod";

export const chatSchema = z.object( {
  roomId: z.string(),
  
})