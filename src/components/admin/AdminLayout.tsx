"use client";

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Image as ImageIcon,
  Upload,
  Home,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Newspaper,
  ShoppingCart,
} from 'lucide-react';
import { clearAdminSession } from '@/lib/admin-auth';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: any;
  description?: string;
}

const navItems: NavItem[] = [
  {
    title: 'Tableau de bord',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'Vue d\'ensemble',
  },
  {
    title: 'Page d\'accueil',
    href: '/admin/homepage',
    icon: Home,
    description: 'Gérer le contenu',
  },
  {
    title: 'Produits',
    href: '/admin/products',
    icon: Package,
    description: 'Gérer les produits',
  },
  {
    title: 'Commandes',
    href: '/admin/orders',
    icon: ShoppingCart,
    description: 'Gérer les commandes',
  },
  {
    title: 'Images',
    href: '/admin/images',
    icon: ImageIcon,
    description: 'Gérer les images',
  },
  {
    title: 'Actualités',
    href: '/admin/news',
    icon: Newspaper,
    description: 'Gérer les actualités',
  },
  {
    title: 'Téléchargements',
    href: '/admin/downloads',
    icon: Upload,
    description: 'Fichiers PDF',
  },
  {
    title: 'Paramètres',
    href: '/admin/settings',
    icon: Settings,
    description: 'Configuration',
  },
];

export default function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 1024;
      setIsMobile(isMobileView);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // #region agent log
    const measureLayout = () => {
      const sidebar = document.querySelector('aside');
      const mainContent = document.querySelector('main')?.parentElement?.parentElement;
      const container = document.querySelector('.min-h-screen.bg-gray-50');
      
      if (sidebar && mainContent && container) {
        const sidebarRect = sidebar.getBoundingClientRect();
        const mainRect = mainContent.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        fetch('http://127.0.0.1:7242/ingest/8c389881-52ef-4ac5-9288-d85afd18b471',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminLayout.tsx:measureLayout',message:'Layout dimensions',data:{sidebar:{top:sidebarRect.top,left:sidebarRect.left,width:sidebarRect.width,height:sidebarRect.height},main:{top:mainRect.top,left:mainRect.left,width:mainRect.width,height:mainRect.height},container:{top:containerRect.top,left:containerRect.left,width:containerRect.width,height:containerRect.height},windowHeight:window.innerHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'layout-fix-v2',hypothesisId:'B'})}).catch(()=>{});
      }
    };
    
    setTimeout(measureLayout, 100);
    // #endregion
  }, []);

  const handleLogout = () => {
    clearAdminSession();
    router.push('/admin');
  };

  const activePath = pathname;

  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Admin', href: '/admin/dashboard' }];
    
    if (paths.length > 1) {
      const page = navItems.find(item => item.href === pathname);
      if (page && pathname !== '/admin/dashboard') {
        breadcrumbs.push({ label: page.title, href: pathname });
      }
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen lg:h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${sidebarCollapsed && !isMobile ? 'lg:translate-x-0 lg:w-16' : 'lg:translate-x-0 lg:w-64'}
          lg:fixed lg:top-0 lg:h-screen lg:z-30
          w-64 flex-shrink-0 overflow-hidden
        `}
      >
        <div className="flex flex-col h-full lg:h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:border-b">
            {!sidebarCollapsed || isMobile ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-gray-900 text-sm">Photon Solar</h2>
                  <p className="text-xs text-gray-500">Administration</p>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 mx-auto">
                <Home className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={sidebarCollapsed ? "Afficher la sidebar" : "Masquer la sidebar"}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                )}
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePath === item.href;
              
              if (sidebarCollapsed && !isMobile) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => isMobile && setSidebarOpen(false)}
                    className={`
                      flex items-center justify-center p-3 rounded-lg transition-all relative
                      ${isActive
                        ? 'bg-orange-50 text-orange-700'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                    title={item.title}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-orange-600' : 'text-gray-500'}`} />
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-600 rounded-r-full" />
                    )}
                  </Link>
                );
              }
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                    ${isActive
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-orange-600' : 'text-gray-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm ${isActive ? 'text-orange-900' : 'text-gray-900'}`}>
                      {item.title}
                    </div>
                    {item.description && (
                      <div className={`text-xs ${isActive ? 'text-orange-600' : 'text-gray-500'}`}>
                        {item.description}
                      </div>
                    )}
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full flex-shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-200">
            {sidebarCollapsed && !isMobile ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-5 h-5 text-gray-500" />
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <LogOut className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <span className="font-medium text-sm">Déconnexion</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed && !isMobile ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left: Mobile menu + Breadcrumbs */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu className="w-6 h-6 text-gray-600" />
                </button>
                
                <div className="flex items-center gap-2">
                  {breadcrumbs.map((crumb, index) => (
                    <div key={`${crumb.href}-${index}`} className="flex items-center gap-2">
                      {index > 0 && (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      {index === breadcrumbs.length - 1 ? (
                        <span className="text-sm font-semibold text-gray-900">
                          {crumb.label}
                        </span>
                      ) : (
                        <Link
                          href={crumb.href}
                          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          {crumb.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  target="_blank"
                  className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Voir le site</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {title && (
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{title}</h1>
              {description && (
                <p className="mt-2 text-sm text-gray-600">{description}</p>
              )}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

