import { z } from "zod";

/**
 * Password validation regex:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

/**
 * Phone number validation regex (basic format)
 * Accepts: +32, 0032, 0, or international formats
 * Allows spaces, dashes, and parentheses for formatting
 */
const phoneRegex = /^[\s\-\(\)]*(\+?32|0032|0)?[\s\-\(\)]*[1-9][\s\-\(\)]*\d{1,4}[\s\-\(\)]*\d{1,4}[\s\-\(\)]*\d{1,4}[\s\-\(\)]*\d{0,4}[\s\-\(\)]*$/;

/**
 * Validation schema for user registration
 */
export const signUpSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes"),
  email: z
    .string()
    .email("L'email n'est pas valide")
    .min(1, "L'email est requis")
    .toLowerCase()
    .refine(
      (email) => {
        // Basic domain validation (you can add more specific rules)
        const validDomains = ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com"];
        const domain = email.split("@")[1];
        // Allow any domain, but you can restrict to specific domains if needed
        return domain && domain.length > 0;
      },
      {
        message: "Le domaine de l'email n'est pas valide",
      }
    ),
  phoneNumber: z
    .string({
      required_error: "Le numéro de téléphone est requis",
    })
    .min(1, "Le numéro de téléphone est requis")
    .refine(
      (val) => {
        if (!val || typeof val !== "string" || val.trim().length === 0) {
          return false;
        }
        // Remove spaces, dashes, parentheses for validation
        const cleaned = val.replace(/[\s\-\(\)]/g, "");
        if (cleaned.length === 0) return false;
        // Check if it's a valid Belgian phone number
        // Should be: +32, 0032, 0, or nothing followed by 9 digits starting with 1-9
        // Allow at least 8 digits total (more lenient)
        const hasDigits = /\d/.test(cleaned);
        const digitCount = (cleaned.match(/\d/g) || []).length;
        return hasDigits && digitCount >= 8;
      },
      {
        message: "Le numéro de téléphone doit contenir au moins 8 chiffres (ex: +32 123 45 67 89, 0123456789)",
      }
    )
    .transform((val) => {
      // Clean the value before saving (remove spaces, dashes, parentheses)
      if (!val || typeof val !== "string") return val;
      const cleaned = val.replace(/[\s\-\(\)]/g, "");
      // Always return cleaned version if it has content, otherwise return original
      return cleaned.length > 0 ? cleaned : val;
    }),
  companyName: z
    .string()
    .max(200, "Le nom de l'entreprise ne peut pas dépasser 200 caractères")
    .optional()
    .nullable(),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(
      passwordRegex,
      "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&#)"
    ),
  confirmPassword: z.string().min(1, "La confirmation du mot de passe est requise"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

/**
 * Validation schema for user login
 */
export const signInSchema = z.object({
  email: z
    .string()
    .email("L'email n'est pas valide")
    .min(1, "L'email est requis")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Le mot de passe est requis"),
});

/**
 * Validation schema for password reset request
 */
export const resetPasswordRequestSchema = z.object({
  email: z
    .string()
    .email("L'email n'est pas valide")
    .min(1, "L'email est requis")
    .toLowerCase(),
});

/**
 * Validation schema for password reset (with token)
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Le token est requis"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(
      passwordRegex,
      "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&#)"
    ),
  confirmPassword: z.string().min(1, "La confirmation du mot de passe est requise"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

/**
 * Validation schema for email verification
 */
export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Le token est requis"),
});

/**
 * Type exports for TypeScript
 */
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

