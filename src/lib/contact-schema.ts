import { z } from "zod";

const singleLine = (min: number, max: number, message: string) =>
  z.string().trim().min(min, message).max(max, `Please use at most ${max} characters`).refine(
    (value) => !/[\u0000-\u001f\u007f]/.test(value),
    "Please remove invalid characters",
  );

export const contactSchema = z.object({
  name: singleLine(2, 100, "Please enter your full name"),
  email: singleLine(1, 255, "Enter a valid email address").pipe(z.string().email("Enter a valid email address")),
  subject: singleLine(3, 200, "Add a brief subject"),
  message: z.string().trim().min(10, "Message must be at least 10 characters")
    .max(5000, "Please use at most 5000 characters")
    .refine((value) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value), "Please remove invalid characters"),
  website: z.string().max(200).optional(),
});

export type ContactInput = z.input<typeof contactSchema>;