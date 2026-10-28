import { z } from "zod";

export const chatSchema = z.object({
  conversationId: z.string().uuid({ message: "Invalid conversation ID format" }).optional(),
  message: z
    .string({ required_error: "Message is required" })
    .trim()
    .min(1, "Message cannot be empty")
    .max(4000, "Message cannot exceed 4000 characters"),
});

export const idParamSchema = z.object({
  id: z.string().uuid({ message: "Invalid ID format" }),
});

