"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProductById, type Product } from "@/data/products";
import { ChevronDown, Mail, Share2, CheckCircle2, ShoppingCart, Plus, Minus, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function ProductPage() {
  const params = useParams();
  const { t, language } = useLanguage();
  const { addItem, openCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<string>("description");
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const productId = params?.id as string;
    if (productId) {
      const foundProduct = getProductById(productId);
      setProduct(foundProduct || null);
    }
  }, [params]);

  if (!product) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-gray-600">
              {language === "fr" ? "Produit non trouvé" : "Product not found"}
            </p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const tabs = [
    { id: "description", label: language === "fr" ? "Description du produit" : "Product Description" },
    { id: "technical", label: language === "fr" ? "Description technique" : "Technical Description" },
    { id: "warranty", label: language === "fr" ? "Garantie" : "Warranty" },
    { id: "documentation", label: language === "fr" ? "Documentation technique" : "Technical Documentation" },
  ];

  // Gestion des images : utiliser images[] si disponible, sinon image, sinon placeholder
  // Filtrer les images invalides (qui n'existent pas)
  const productImages = product.images && product.images.length > 0
    ? product.images.filter(img => img && img !== "/placeholder-product.jpg")
    : product.image && product.image !== "/placeholder-product.jpg"
    ? [product.image]
    : [];
  
  // Si aucune image valide, utiliser placeholder
  const displayImages = productImages.length > 0 ? productImages : ["/placeholder-product.jpg"];

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm">
            <ol className="flex items-center space-x-2 text-gray-600">
              <li>
                <Link href="/" className="hover:text-orange-600 transition-colors">
                  {language === "fr" ? "Accueil" : "Home"}
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href={`/collections/${product.category}`} className="hover:text-orange-600 transition-colors">
                  {product.category}
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-900 font-medium">{product.name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <div>
              <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
                {displayImages[imageIndex] && displayImages[imageIndex] !== "/placeholder-product.jpg" ? (
                  <Image
                    src={displayImages[imageIndex]}
                    alt={`${product.name} - Image ${imageIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={imageIndex === 0}
                    onError={(e) => {
                      // Si l'image ne charge pas, afficher le placeholder
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.placeholder-fallback')) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center placeholder-fallback';
                        placeholder.innerHTML = `<span class="text-gray-400 text-sm">${language === "fr" ? "Image produit" : "Product image"}</span>`;
                        parent.appendChild(placeholder);
                      }
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">
                      {language === "fr" ? "Image produit" : "Product image"}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {displayImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {displayImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setImageIndex(index)}
                      className={`relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                        imageIndex === index ? "border-orange-600" : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      {img && img !== "/placeholder-product.jpg" ? (
                        <Image
                          src={img}
                          alt={`${product.name} - Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 25vw, 12.5vw"
                          onError={(e) => {
                            // Si l'image ne charge pas, afficher un placeholder
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                  {product.brand}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>
                {product.sku && (
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>SKU:</strong> {product.sku}
                  </p>
                )}
              </div>

              {/* Short Description */}
              {product.description && (
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed">
                    {product.description.length > 200
                      ? `${product.description.substring(0, 200)}...`
                      : product.description}
                  </p>
                  {product.description.length > 200 && (
                    <button
                      onClick={() => {
                        setActiveTab("description");
                        // Scroll to tabs section smoothly
                        setTimeout(() => {
                          tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }, 100);
                      }}
                      className="text-orange-600 hover:text-orange-700 font-semibold mt-2 text-sm transition-colors"
                    >
                      {language === "fr" ? "Lisez plus" : "Read more"}
                    </button>
                  )}
                </div>
              )}

              {/* Key Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {language === "fr" ? "Caractéristiques principales" : "Key Features"}
                  </h3>
                  <ul className="space-y-2">
                    {product.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Specs */}
              <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {language === "fr" ? "Spécifications" : "Specifications"}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {product.power && (
                    <div>
                      <span className="text-gray-600">{language === "fr" ? "Puissance" : "Power"}:</span>
                      <span className="ml-2 font-semibold text-gray-900">{product.power}</span>
                    </div>
                  )}
                  {product.type && (
                    <div>
                      <span className="text-gray-600">{language === "fr" ? "Type" : "Type"}:</span>
                      <span className="ml-2 font-semibold text-gray-900">{product.type}</span>
                    </div>
                  )}
                  {product.voltage && (
                    <div>
                      <span className="text-gray-600">{language === "fr" ? "Voltage" : "Voltage"}:</span>
                      <span className="ml-2 font-semibold text-gray-900">{product.voltage}</span>
                    </div>
                  )}
                  {product.warranty && (
                    <div>
                      <span className="text-gray-600">{language === "fr" ? "Garantie" : "Warranty"}:</span>
                      <span className="ml-2 font-semibold text-gray-900">{product.warranty}</span>
                    </div>
                  )}
                  {product.weight && (
                    <div>
                      <span className="text-gray-600">{language === "fr" ? "Poids" : "Weight"}:</span>
                      <span className="ml-2 font-semibold text-gray-900">{product.weight}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                {product.price ? (
                  <div className="flex items-baseline gap-3">
                    {product.originalPrice && product.originalPrice > product.price && (
                      <>
                        <span className="text-2xl font-bold text-gray-900">
                          € {product.price.toFixed(2)}
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          € {product.originalPrice.toFixed(2)}
                        </span>
                        <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </span>
                      </>
                    )}
                    {(!product.originalPrice || product.originalPrice <= product.price) && (
                      <span className="text-3xl font-bold text-gray-900">
                        € {product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-lg text-gray-600">
                    {language === "fr" ? "Prix sur demande" : "Price on request"}
                  </div>
                )}
              </div>

              {/* Add to Cart Section */}
              {product.price ? (
                <div className="mb-8 p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm font-medium text-gray-700">
                      {language === "fr" ? "Quantité" : "Quantity"}:
                    </span>
                    <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                        disabled={quantity <= 1}
                      >
                        <Minus size={18} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 text-center border-x border-gray-300 py-2 font-semibold text-gray-900 focus:outline-none"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      = <strong className="text-gray-900">€ {(product.price * quantity).toFixed(2)}</strong>
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <motion.button
                    onClick={() => {
                      addItem(product, quantity);
                      setAddedToCart(true);
                      setTimeout(() => {
                        setAddedToCart(false);
                        openCart();
                      }, 800);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      w-full py-4 px-6 rounded-xl font-bold text-lg
                      flex items-center justify-center gap-3
                      transition-all duration-300 ease-out
                      ${addedToCart 
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                        : 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40'
                      }
                    `}
                  >
                    {addedToCart ? (
                      <>
                        <Check size={24} className="animate-bounce" />
                        <span>{language === "fr" ? "Ajouté !" : "Added!"}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={24} />
                        <span>{language === "fr" ? "Ajouter au panier" : "Add to cart"}</span>
                      </>
                    )}
                  </motion.button>
                </div>
              ) : (
                <div className="mb-8 p-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                  <p className="text-gray-600 text-sm mb-4">
                    {language === "fr" 
                      ? "Ce produit nécessite un devis personnalisé. Contactez-nous pour obtenir le meilleur prix."
                      : "This product requires a custom quote. Contact us for the best price."}
                  </p>
                  <a
                    href={`mailto:info@photonsolar.be?subject=${encodeURIComponent((language === "fr" ? "Demande de devis: " : "Quote request: ") + product.name)}&body=${encodeURIComponent(language === "fr" ? `Bonjour,\n\nJe souhaiterais obtenir un devis pour le produit suivant:\n\n${product.name}\nRéférence: ${product.sku || 'N/A'}\n\nMerci de me contacter.\n\nCordialement` : `Hello,\n\nI would like to request a quote for the following product:\n\n${product.name}\nReference: ${product.sku || 'N/A'}\n\nPlease contact me.\n\nBest regards`)}`}
                    className="
                      w-full py-4 px-6 rounded-xl font-bold text-lg
                      flex items-center justify-center gap-3
                      bg-gradient-to-r from-gray-700 to-gray-900 text-white 
                      shadow-lg shadow-gray-900/20 
                      hover:shadow-xl hover:shadow-gray-900/30
                      transition-all duration-300 ease-out
                      hover:scale-[1.02] active:scale-[0.98]
                    "
                  >
                    <Mail size={24} />
                    <span>{language === "fr" ? "Demander un devis" : "Request a quote"}</span>
                  </a>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-4 mb-8">
                <div className="flex gap-4">
                  <button
                    onClick={async () => {
                      const url = window.location.href;
                      if (navigator.share) {
                        try {
                          await navigator.share({
                            title: product.name,
                            text: product.description || product.name,
                            url: url,
                          });
                        } catch (err) {
                          // User cancelled or error
                        }
                      } else {
                        // Fallback: copy to clipboard
                        await navigator.clipboard.writeText(url);
                        alert(language === "fr" ? "Lien copié dans le presse-papiers" : "Link copied to clipboard");
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-3 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                  >
                    <Share2 size={18} />
                    {language === "fr" ? "Partager" : "Share"}
                  </button>
                  <a
                    href={`mailto:info@photonsolar.be?subject=${encodeURIComponent(language === "fr" ? "Question sur le produit: " : "Question about product: ") + product.name}`}
                    className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-3 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                  >
                    <Mail size={18} />
                    {language === "fr" ? "Poser une question" : "Ask a question"}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div ref={tabsRef} className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-200">
              <div className="flex flex-wrap">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 font-semibold text-sm border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-orange-600 text-orange-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8">
              {activeTab === "description" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {language === "fr" ? "Description du produit" : "Product Description"}
                  </h2>
                  <div className="prose max-w-none text-gray-700 leading-relaxed">
                    {product.description ? (
                      <p>{product.description}</p>
                    ) : (
                      <p>
                        {language === "fr"
                          ? "Ce produit est conçu pour répondre aux besoins les plus exigeants en matière d'énergie solaire. Qualité premium et performance garantie."
                          : "This product is designed to meet the most demanding solar energy needs. Premium quality and guaranteed performance."}
                      </p>
                    )}
                    {product.features && (
                      <div className="mt-6">
                        <h3 className="font-semibold text-gray-900 mb-3">
                          {language === "fr" ? "Caractéristiques" : "Features"}
                        </h3>
                        <ul className="space-y-2">
                          {product.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle2 size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "technical" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {language === "fr" ? "Description technique" : "Technical Description"}
                  </h2>
                  <div className="prose max-w-none text-gray-700 leading-relaxed">
                    {product.technicalDescription ? (
                      <p>{product.technicalDescription}</p>
                    ) : (
                      <p>
                        {language === "fr"
                          ? "Spécifications techniques détaillées du produit."
                          : "Detailed technical specifications of the product."}
                      </p>
                    )}
                    {product.specifications && (
                      <div className="mt-6">
                        <h3 className="font-semibold text-gray-900 mb-4">
                          {language === "fr" ? "Spécifications détaillées" : "Detailed Specifications"}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(product.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-600">{key}:</span>
                              <span className="font-semibold text-gray-900">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "warranty" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {language === "fr" ? "Garantie" : "Warranty"}
                  </h2>
                  <div className="prose max-w-none text-gray-700 leading-relaxed">
                    <p>
                      {product.warranty ? (
                        <>
                          {language === "fr" ? (
                            <>
                              Ce produit bénéficie d'une garantie de <strong>{product.warranty}</strong>. 
                              La garantie couvre les défauts de fabrication et de matériaux. 
                              Pour toute réclamation, veuillez contacter notre service client.
                            </>
                          ) : (
                            <>
                              This product comes with a <strong>{product.warranty}</strong> warranty. 
                              The warranty covers manufacturing defects and material issues. 
                              For any claim, please contact our customer service.
                            </>
                          )}
                        </>
                      ) : (
                        language === "fr"
                          ? "Garantie standard selon les conditions du fabricant."
                          : "Standard warranty according to manufacturer conditions."
                      )}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "documentation" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {language === "fr" ? "Documentation technique" : "Technical Documentation"}
                  </h2>
                  <div className="prose max-w-none text-gray-700 leading-relaxed">
                    <p className="mb-4">
                      {language === "fr"
                        ? "Téléchargez la documentation technique complète pour ce produit."
                        : "Download the complete technical documentation for this product."}
                    </p>
                    <div className="space-y-2">
                      {product.documentation?.installationManual ? (
                        <a
                          href={product.documentation.installationManual}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">
                              {language === "fr" ? "Manuel d'installation" : "Installation Manual"}
                            </span>
                            <ChevronDown size={20} className="text-gray-400 rotate-[-90deg]" />
                          </div>
                        </a>
                      ) : (
                        <div className="block p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-50">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-500">
                              {language === "fr" ? "Manuel d'installation" : "Installation Manual"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {language === "fr" ? "Bientôt disponible" : "Coming soon"}
                            </span>
                          </div>
                        </div>
                      )}
                      {product.documentation?.technicalSheet ? (
                        <a
                          href={product.documentation.technicalSheet}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">
                              {language === "fr" ? "Fiche technique" : "Technical Sheet"}
                            </span>
                            <ChevronDown size={20} className="text-gray-400 rotate-[-90deg]" />
                          </div>
                        </a>
                      ) : (
                        <div className="block p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-50">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-500">
                              {language === "fr" ? "Fiche technique" : "Technical Sheet"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {language === "fr" ? "Bientôt disponible" : "Coming soon"}
                            </span>
                          </div>
                        </div>
                      )}
                      {product.documentation?.userGuide ? (
                        <a
                          href={product.documentation.userGuide}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">
                              {language === "fr" ? "Guide d'utilisation" : "User Guide"}
                            </span>
                            <ChevronDown size={20} className="text-gray-400 rotate-[-90deg]" />
                          </div>
                        </a>
                      ) : (
                        <div className="block p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-50">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-500">
                              {language === "fr" ? "Guide d'utilisation" : "User Guide"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {language === "fr" ? "Bientôt disponible" : "Coming soon"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

