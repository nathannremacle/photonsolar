"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { X, Plus, Minus, ShoppingCart, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { safeFetchJson } from "@/utils/api";

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, getTotalItems, getTotalPrice, isOpen, closeCart } = useCart();
  const { language } = useLanguage();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setIsProcessing(true);
    try {
      const cartItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const { data, error } = await safeFetchJson<{
        success?: boolean;
        order?: any;
        error?: string;
        requiresAuth?: boolean;
      }>("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: cartItems }),
      });

      // Handle not authenticated error
      if (data?.requiresAuth || error?.includes("connecté") || error?.includes("401") || data?.error?.includes("connecté")) {
        const confirmLogin = confirm(
          language === "fr" 
            ? "Vous devez être connecté pour passer une commande. Voulez-vous vous connecter ?" 
            : "You must be logged in to place an order. Do you want to log in?"
        );
        if (confirmLogin) {
          closeCart();
          router.push("/login");
        }
        return;
      }

      if (error || !data?.success) {
        alert(error || data?.error || (language === "fr" ? "Erreur lors de la validation de la commande" : "Error during checkout"));
        return;
      }

      // Clear cart on success
      clearCart();
      closeCart();

      // Redirect to success page or profile
      router.push(`/profile?order=${data.order?.id || "success"}`);
    } catch (error) {
      console.error("Checkout error:", error);
      alert(language === "fr" ? "Une erreur est survenue lors de la validation de la commande" : "An error occurred during checkout");
    } finally {
      // Always reset processing state
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Slide-over */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {language === "fr" ? "Panier" : "Cart"}
            </h2>
            {totalItems > 0 && (
              <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={language === "fr" ? "Fermer le panier" : "Close cart"}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg mb-2">
                {language === "fr" ? "Votre panier est vide" : "Your cart is empty"}
              </p>
              <p className="text-gray-500 text-sm">
                {language === "fr"
                  ? "Ajoutez des produits pour commencer"
                  : "Add products to get started"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  {/* Product Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                    {item.product.image || item.product.images?.[0] ? (
                      <Image
                        src={item.product.image || item.product.images?.[0] || "/placeholder-product.jpg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        {language === "fr" ? "Image" : "Image"}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={item.product.link}
                      onClick={closeCart}
                      className="block"
                    >
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 hover:text-orange-600 transition-colors">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 mb-2">{item.product.brand}</p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        aria-label={language === "fr" ? "Diminuer la quantité" : "Decrease quantity"}
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        aria-label={language === "fr" ? "Augmenter la quantité" : "Increase quantity"}
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-900">
                        {item.product.price
                          ? `€ ${(item.product.price * item.quantity).toFixed(2)}`
                          : language === "fr"
                          ? "Prix sur demande"
                          : "Price on request"}
                      </p>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        aria-label={language === "fr" ? "Retirer du panier" : "Remove from cart"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-white">
            {/* Total */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900">
                {language === "fr" ? "Total" : "Total"}
              </span>
              <span className="text-xl font-bold text-orange-600">
                € {totalPrice.toFixed(2)}
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={clearCart}
                disabled={isProcessing}
                className="w-full py-2 px-4 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                {language === "fr" ? "Vider le panier" : "Clear cart"}
              </button>
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {language === "fr" ? "Traitement..." : "Processing..."}
                  </>
                ) : (
                  language === "fr" ? "Valider le devis" : "Checkout"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

