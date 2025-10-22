import { z } from "zod";

// OTP Schema
export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^[0-9]+$/, "OTP must contain only numbers"),
});

export type OtpInput = z.infer<typeof otpSchema>;
