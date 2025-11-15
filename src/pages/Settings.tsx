import { ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSongs } from '../context/SongContext';
import { useSession } from '../context/SessionContext';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../integrations/supabase/client';

export const Settings = () => {
  const navigate = useNavigate();
  const { prompterSettings, updatePrompterSettings } = useSongs();
  const { session, userProfile } = useSession();
  const { appSettings, updateAppSettings } = useAppContext();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erreur lors de la déconnexion:', error.message);
    } else {
      navigate('/login');
    }
  };

  const accountTitle = userProfile?.role === 'admin' ? 'Compte administrateur' : 'Compte utilisateur';

  return (
    <div className="p-4 dark:bg-black dark:text-gray-200 min-h-screen">
      <div className="flex items-center mb-6 pt-safe-area">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold ml-2">Paramètres</h1>
      </div>

      {session?.user && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-black dark:border-gray-700"> {/* Changement ici */}
          <h2 className="text-lg font-semibold mb-2">{accountTitle}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">Connecté en tant que : <span className="font-medium">{session.user.email}</span></p>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      )}

      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-black dark:border-gray-700"> {/* Changement ici */}
        <h2 className="text-lg font-semibold mb-4">Paramètres généraux</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Mode sombre (Application)
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={appSettings.isAppDarkMode}
                onChange={e => updateAppSettings({
                  isAppDarkMode: e.target.checked
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Couleurs vives (Tuiles de chants)
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={appSettings.useVividColors}
                onChange={e => updateAppSettings({
                  useVividColors: e.target.checked
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-black dark:border-gray-700"> {/* Changement ici */}
        <h2 className="text-lg font-semibold mb-4">Paramètres du prompteur</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Intervalle de rotation (secondes)
            </label>
            <input
              type="number"
              min="30"
              max="300"
              step="30"
              value={prompterSettings.rotationInterval}
              onChange={e => updatePrompterSettings({
                rotationInterval: Number(e.target.value)
              })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200" {/* Changement ici */}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Taille de police
            </label>
            <select
              value={prompterSettings.fontSize}
              onChange={e => updatePrompterSettings({
                fontSize: e.target.value as 'small' | 'medium' | 'large'
              })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200" {/* Changement ici */}
            >
              <option value="small">Petite</option>
              <option value="medium">Moyenne</option>
              <option value="large">Grande</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Mode sombre
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prompterSettings.isDarkMode}
                onChange={e => updatePrompterSettings({
                  isDarkMode: e.target.checked
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Contraste élevé
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prompterSettings.useHighContrast}
                onChange={e => updatePrompterSettings({
                  useHighContrast: e.target.checked
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Texte en majuscules
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prompterSettings.upperCase}
                onChange={e => updatePrompterSettings({
                  upperCase: e.target.checked
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};