import { Home, Plus, Play } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useSession } from '../context/SessionContext'; // Import de useSession
import { useAppContext } from '../context/AppContext'; // Import de useAppContext

export const Navigation = () => {
  const location = useLocation();
  const { userProfile } = useSession(); // Récupération du profil utilisateur
  const { appSettings } = useAppContext(); // Utilisation du nouveau contexte
  const isAdmin = userProfile?.role === 'admin'; // Vérification du rôle admin
  const hideNavigation = document.documentElement.classList.contains('reading-mode');

  if (hideNavigation) return null;

  const isActive = (path: string) => location.pathname === path;

  const navBgClass = appSettings.isAppDarkMode ? 'bg-black border-t-gray-700' : 'bg-white border-t-gray-200';
  const inactiveIconClass = appSettings.isAppDarkMode ? 'text-gray-300' : 'text-gray-600';
  const activeIconClass = appSettings.isAppDarkMode ? 'text-blue-400' : 'text-blue-600';

  return (
    <nav className={`fixed bottom-0 left-0 right-0 border-t pb-safe-area ${navBgClass}`}>
      <div className="flex justify-around items-center h-16">
        <Link
          to="/"
          className={`flex flex-col items-center space-y-1 ${
            isActive('/') ? activeIconClass : inactiveIconClass
          }`}
        >
          <Home size={24} />
          <span className="text-xs">Accueil</span>
        </Link>
        {isAdmin && ( // Afficher le lien "Ajouter" seulement pour les admins
          <Link
            to="/add"
            className={`flex flex-col items-center space-y-1 ${
              isActive('/add') ? activeIconClass : inactiveIconClass
            }`}
          >
            <Plus size={24} />
            <span className="text-xs">Ajouter</span>
          </Link>
        )}
        <Link
          to="/prompter"
          className={`flex flex-col items-center space-y-1 ${
            isActive('/prompter') ? activeIconClass : inactiveIconClass
          }`}
        >
          <Play size={24} />
          <span className="text-xs">Prompteur</span>
        </Link>
      </div>
    </nav>
  );
};