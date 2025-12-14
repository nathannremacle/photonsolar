"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { resetPasswordRequestSchema, resetPasswordSchema } from "@/lib/validations/auth";
import type { ResetPasswordRequestInput, ResetPasswordInput } from "@/lib/validations/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastContainer, useToast } from "@/components/Toast";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, success, error, removeToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestMode, setIsRequestMode] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
      setIsRequestMode(false);
    }
  }, [searchParams]);

  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    formState: { errors: errorsRequest },
  } = useForm<ResetPasswordRequestInput>({
    resolver: zodResolver(resetPasswordRequestSchema),
  });

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: errorsReset },
    watch,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password");

  const onRequestSubmit = async (data: ResetPasswordRequestInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "request",
          email: data.email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.rateLimited) {
          error(result.error || "Trop de demandes. Veuillez réessayer plus tard.");
        } else {
          error(result.error || "Une erreur est survenue. Veuillez réessayer.");
        }
        setIsLoading(false);
        return;
      }

      success(
        "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé. Vérifiez votre boîte de réception.",
        8000
      );

      // Clear form
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      console.error("Reset password request error:", err);
      error("Une erreur est survenue. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      error("Token manquant. Veuillez utiliser le lien reçu par email.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "reset",
          token: token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error.includes("expiré")) {
          error("Le token a expiré. Veuillez demander un nouveau lien de réinitialisation.");
          setTimeout(() => {
            setIsRequestMode(true);
            setToken(null);
          }, 2000);
        } else {
          error(result.error || "Une erreur est survenue. Veuillez réessayer.");
        }
        setIsLoading(false);
        return;
      }

      success("Votre mot de passe a été réinitialisé avec succès ! Redirection vers la page de connexion...", 5000);

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      error("Une erreur est survenue. Veuillez réessayer.");
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isRequestMode ? "Réinitialiser le mot de passe" : "Nouveau mot de passe"}
              </h1>
              <p className="text-gray-600">
                {isRequestMode
                  ? "Entrez votre email pour recevoir un lien de réinitialisation"
                  : "Entrez votre nouveau mot de passe"}
              </p>
            </div>

            {isRequestMode ? (
              <form onSubmit={handleSubmitRequest(onRequestSubmit)} className="space-y-6">
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
                      {...registerRequest("email")}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errorsRequest.email
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="votre@email.com"
                      autoComplete="email"
                    />
                  </div>
                  {errorsRequest.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errorsRequest.email.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Envoi...</span>
                    </>
                  ) : (
                    "Envoyer le lien de réinitialisation"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmitReset(onResetSubmit)} className="space-y-6">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...registerReset("password")}
                      className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errorsReset.password
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
                  {errorsReset.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errorsReset.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...registerReset("confirmPassword")}
                      className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errorsReset.confirmPassword
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
                  {errorsReset.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errorsReset.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Réinitialisation...</span>
                    </>
                  ) : (
                    "Réinitialiser le mot de passe"
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  );
}

