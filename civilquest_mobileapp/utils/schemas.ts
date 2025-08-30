import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Event schemas
export const createEventSchema = z.object({
  eventTitle: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  eventDescription: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, "Event date must be today or in the future"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: z
    .string()
    .min(3, "Location must be at least 3 characters")
    .max(200, "Location must be less than 200 characters"),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be less than 100 characters"),
  eventType: z.string().min(1, "Event type is required"),
  reward: z.string().min(1, "Reward is required"),
  image_url: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

export const sponsorshipSchema = z
  .object({
    sponsorType: z.enum(["AMOUNT", "DONATION"] as const),
    amount: z.string().optional().default(""),
    donationAmount: z.string().optional().default(""),
    donation: z.string().optional().default(""),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description must be less than 500 characters"),
  })
  .superRefine((data, ctx) => {
    if (data.sponsorType === "AMOUNT") {
      if (!data.amount || isNaN(Number(data.amount)) || Number(data.amount) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Amount must be a positive number",
          path: ["amount"],
        });
      }
    } else if (data.sponsorType === "DONATION") {
      const hasDonationAmount = !!data.donationAmount && !isNaN(Number(data.donationAmount)) && Number(data.donationAmount) > 0;
      const hasDonationText = !!data.donation && data.donation.trim().length > 0;
      if (!hasDonationAmount && !hasDonationText) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Provide donation amount or details",
          path: ["donationAmount"],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Provide donation amount or details",
          path: ["donation"],
        });
      } else if (!!data.donationAmount && (isNaN(Number(data.donationAmount)) || Number(data.donationAmount) <= 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Donation amount must be a positive number",
          path: ["donationAmount"],
        });
      }
    }
  });

export const sponsorshipApplicationSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  sponsorshipType: z.enum(["gold", "silver", "bronze"], {
    message: "Please select a sponsorship type",
  }),
  amount: z
    .number()
    .min(100, "Minimum sponsorship amount is $100")
    .max(50000, "Maximum sponsorship amount is $50,000"),
  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters"),
  contactEmail: z
    .string()
    .min(1, "Contact email is required")
    .email("Please enter a valid email"),
  message: z
    .string()
    .max(1000, "Message must be less than 1000 characters")
    .optional(),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s-()]+$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type SponsorshipFormData = z.infer<typeof sponsorshipSchema>;
export type SponsorshipApplicationFormData = z.infer<
  typeof sponsorshipApplicationSchema
>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
