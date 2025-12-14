"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signUpSchema } from "@/lib/validations/auth";
import type { SignUpInput } from "@/lib/validations/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastContainer, useToast } from "@/components/Toast";
import { Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle2, Phone, Building2 } from "lucide-react";
import { safeFetchJson } from "@/utils/api";

export default function RegisterPage() {
  const router = useRouter();
  const { toasts, success, error, removeToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const password = watch("password");

  const onSubmit = async (data: SignUpInput) => {
    setIsLoading(true);

    try {
      // Log form data (without password) for debugging
      console.log("Submitting registration:", {
        email: data.email,
        name: data.name,
        phoneNumber: data.phoneNumber,
        companyName: data.companyName,
        hasPassword: !!data.password,
      });

      const { data: result, error: fetchError } = await safeFetchJson<{
        success?: boolean;
        user?: any;
        error?: string;
        field?: string;
        details?: Array<{ field: string; message: string }>;
      }>("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // Log full response for debugging
      console.log("Registration response:", { fetchError, result, hasResult: !!result });

      // Check for fetch error first
      if (fetchError) {
        console.error("Registration fetch error:", fetchError);
        error(fetchError);
        setIsLoading(false);
        return;
      }

      // Check if result is null or empty
      if (!result || typeof result !== "object") {
        console.error("Registration error: Invalid response", result);
        error("Une erreur est survenue lors de l'inscription. Réponse invalide du serveur.");
        setIsLoading(false);
        return;
      }

      // Check for success
      if (result.success === true) {
        // Success case - handled below
      } else {
        // Handle validation errors or other errors
        if (result.details && Array.isArray(result.details) && result.details.length > 0) {
          // Show first validation error
          const firstError = result.details[0];
          error(firstError.message || result.error || "Données invalides");
        } else if (result.field === "email") {
          error(result.error || "Un compte avec cet email existe déjà.");
        } else if (result.error) {
          error(result.error);
        } else {
          error("Une erreur est survenue lors de l'inscription.");
        }
        setIsLoading(false);
        return;
      }

      // Success
      success(
        "Compte créé avec succès ! Vous pouvez maintenant vous connecter.",
        5000
      );

      // Redirect to login after a delay
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      console.error("Registration error:", err);
      error("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string = "") => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&#]/.test(password)) strength++;

    const levels = [
      { label: "Très faible", color: "bg-red-500" },
      { label: "Faible", color: "bg-orange-500" },
      { label: "Moyen", color: "bg-yellow-500" },
      { label: "Fort", color: "bg-green-500" },
      { label: "Très fort", color: "bg-green-600" },
    ];

    return levels[strength - 1] || { label: "", color: "" };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Créer un compte
              </h1>
              <p className="text-gray-600">
                Rejoignez Photon Solar et accédez à tous nos services
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nom complet
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    {...register("name")}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.name
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Jean Dupont"
                    autoComplete="name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.email
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="votre@email.com"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone Number Field */}
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Numéro de téléphone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phoneNumber"
                    type="tel"
                    {...register("phoneNumber")}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.phoneNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="+32 123 45 67 89 ou 0123456789"
                    autoComplete="tel"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phoneNumber.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Format accepté : +32, 0032, 0 ou format international
                </p>
              </div>

              {/* Company Name Field */}
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nom de l'entreprise <span className="text-gray-400">(optionnel)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="companyName"
                    type="text"
                    {...register("companyName")}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.companyName
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Nom de votre entreprise"
                    autoComplete="organization"
                  />
                </div>
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.password
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
                {/* Password Strength Indicator */}
                {password && password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`h-2 flex-1 rounded-full ${passwordStrength.color}`}
                      />
                      <span className="text-xs text-gray-600">
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <p>Le mot de passe doit contenir :</p>
                      <ul className="list-disc list-inside space-y-0.5 mt-1">
                        <li
                          className={
                            password.length >= 8
                              ? "text-green-600"
                              : "text-gray-400"
                          }
                        >
                          Au moins 8 caractères
                        </li>
                        <li
                          className={
                            /[a-z]/.test(password)
                              ? "text-green-600"
                              : "text-gray-400"
                          }
                        >
                          Une minuscule
                        </li>
                        <li
                          className={
                            /[A-Z]/.test(password)
                              ? "text-green-600"
                              : "text-gray-400"
                          }
                        >
                          Une majuscule
                        </li>
                        <li
                          className={
                            /\d/.test(password)
                              ? "text-green-600"
                              : "text-gray-400"
                          }
                        >
                          Un chiffre
                        </li>
                        <li
                          className={
                            /[@$!%*?&#]/.test(password)
                              ? "text-green-600"
                              : "text-gray-400"
                          }
                        >
                          Un caractère spécial (@$!%*?&#)
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Création du compte...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Créer mon compte</span>
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Vous avez déjà un compte ?{" "}
                <Link
                  href="/login"
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  );
}

