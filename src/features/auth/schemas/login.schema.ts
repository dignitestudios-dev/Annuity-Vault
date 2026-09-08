import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address").max(100, "Email must be less than 100 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").max(50, "Password must be less than 50 characters"),
});
