import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.coerce.number().int().min(10, "Min age 10").max(120, "Max age 120"),
  gender: z.enum(["male", "female"]),
  weight: z.coerce.number().min(20, "Min 20 kg").max(300, "Max 300 kg"),
  height: z.coerce.number().min(100, "Min 100 cm").max(250, "Max 250 cm"),
  activity: z.enum([
    "sedentary",
    "lightly_active",
    "moderately_active",
    "very_active",
    "extra_active",
  ]),
  goal: z.enum(["lose", "maintain", "gain"]),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type ProfileFormInput = z.input<typeof profileSchema>;
