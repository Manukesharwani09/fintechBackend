import { z } from "zod";

const loginBodySchema = z.object({
  email: z
    .string({ required_error: "email is required" })
    .trim()
    .email("Please provide a valid email address."),
  password: z
    .string({ required_error: "password is required" })
    .min(8, "Password must be between 8 and 128 characters.")
    .max(128, "Password must be between 8 and 128 characters."),
});

export { loginBodySchema };
