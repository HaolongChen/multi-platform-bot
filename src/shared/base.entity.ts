import type { z } from "zod";

export class BaseEntity<T extends z.ZodObject>
{
  constructor(private data: z.output<T>)
}