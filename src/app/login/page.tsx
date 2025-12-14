"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signInSchema } from "@/lib/validations/auth";
import type { SignInInput } from "@/lib/validations/auth";
import { signIn } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastContainer, useToast } from "@/components/Toast";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, success, error, removeToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  // Check for query parameters (email verification, errors, etc.)
  useEffect(() => {
    const verified = searchParams.get("verified");
    const errorParam = searchParams.get("error");
    const verifiedEmail = searchParams.get("email");

    if (verified === "true") {
      success("Email vérifié avec succès ! Vous pouvez maintenant vous connecter.");
    }

    if (errorParam) {
      const errorMessages: Record<string, string> = {
        missing_token: "Token de vérification manquant.",
        invalid_token: "Token de vérification invalide.",
        token_not_found: "Token de vérification non trouvé.",
        token_expired: "Le token de vérification a expiré. Veuillez demander un nouveau lien.",
        verification_failed: "Erreur lors de la vérification de l'email.",
        CredentialsSignin: "Email ou mot de passe incorrect.",
        Configuration: "Erreur de configuration du serveur.",
        AccessDenied: "Accès refusé.",
        Verification: "Erreur de vérification.",
      };

      error(errorMessages[errorParam] || "Une erreur est survenue.");
    }
  }, [searchParams, success, error]);

  const onSubmit = async (data: SignInInput) => {
    setIsLoading(true);

    try {
      // Sign in using NextAuth
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setError("email", {
            type: "manual",
            message: "Email ou mot de passe incorrect.",
          });
          setError("password", {
            type: "manual",
            message: "Email ou mot de passe incorrect.",
          });
          error("Email ou mot de passe incorrect.");
        } else {
          error("Une erreur est survenue lors de la connexion. Veuillez réessayer.");
        }
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        success("Connexion réussie ! Redirection en cours...");
        // Redirect to home page or previous page
        const callbackUrl = searchParams.get("callbackUrl") || "/";
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 1000);
      }
    } catch (err) {
      console.error("Login error:", err);
      error("Une erreur est survenue lors de la connexion. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h1>
              <p className="text-gray-600">
                Connectez-vous à votre compte Photon Solar
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                    autoComplete="current-password"
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
              </div>

              {/* Forgot Password Link */}
              <div className="flex items-center justify-end">
                <Link
                  href="/reset-password"
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Mot de passe oublié ?
                </Link>
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
                    <span>Connexion...</span>
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Vous n'avez pas de compte ?{" "}
                <Link
                  href="/register"
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Créer un compte
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

