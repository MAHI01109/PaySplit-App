import { z } from "zod";

export const onboardingSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    currency: z.enum(["INR", "USD", "EUR"], {
      message: "Currency is required",
    }),
    avatarColor: z.string({ message: "Avatar color is required" }).min(1, "Avatar color is required"),
  })

export type OnboardingFormData = z.infer<typeof onboardingSchema>;