"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  ArrowLeft,
  Settings as SettingsIcon,
  Lock,
  Key
} from 'lucide-react';
import { checkAdminSession } from '@/lib/admin-auth';

export default function AdminSettings() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [settings, setSettings] = useState({
    adminPassword: '',
    siteName: 'Photon Solar',
    siteUrl: 'https://www.photonsolar.be',
  });
  const [saving, setSaving] = useState(false);
  const [validatingPassword, setValidatingPassword] = useState(false);
  const [passwordField, setPasswordField] = useState('');

  useEffect(() => {
    if (!checkAdminSession()) {
      router.push('/admin');
      return;
    }
    setAuthenticated(true);
  }, [router]);

  const handleValidatePassword = async () => {
    if (!passwordField) {
      alert('Veuillez entrer un nouveau mot de passe');
      return;
    }

    if (passwordField.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setValidatingPassword(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, adminPassword: passwordField }),
      });

      if (response.ok) {
        alert('Mot de passe changé avec succès! Vous devrez vous reconnecter.');
        setPasswordField('');
        setSettings({ ...settings, adminPassword: '' });
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Erreur lors du changement de mot de passe');
    } finally {
      setValidatingPassword(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Paramètres sauvegardés avec succès!');
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
                <p className="text-sm text-gray-600 mt-1">Configuration générale du site</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow space-y-6 p-6">
          {/* Security */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold">Sécurité</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe admin
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={passwordField}
                    onChange={(e) => setPasswordField(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Entrez un nouveau mot de passe (min. 6 caractères)"
                  />
                  <button
                    onClick={handleValidatePassword}
                    disabled={validatingPassword || !passwordField}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {validatingPassword ? 'Validation...' : 'Valider'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Le mot de passe doit contenir au moins 6 caractères. Cliquez sur "Valider" pour confirmer le changement.
                </p>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Où est stocké le mot de passe ?</strong><br />
                    Le mot de passe est stocké dans : <code className="bg-yellow-100 px-1 rounded">data/admin-settings.json</code> (fichier local) ou dans la variable d'environnement <code className="bg-yellow-100 px-1 rounded">ADMIN_PASSWORD</code> si définie.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Site Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <SettingsIcon className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold">Informations du site</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du site
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL du site
                </label>
                <input
                  type="url"
                  value={settings.siteUrl}
                  onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Note importante</h3>
            <p className="text-sm text-blue-800">
              Les modifications apportées aux paramètres nécessitent un redémarrage du serveur pour être prises en compte.
              En production, utilisez des variables d'environnement pour les paramètres sensibles.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

