import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SongProvider } from './context/SongContext';
import { SessionProvider, useSession } from './context/SessionContext';
import { AppProvider, useAppContext } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { SongForm } from './pages/SongForm';
import { Prompter } from './pages/Prompter';
import { Settings } from './pages/Settings';
import { SongView } from './pages/SongView';
import { Login } from './pages/Login';

const AppContent = () => {
  const location = useLocation();
  const { session, loading } = useSession();
  const { appSettings } = useAppContext();
  const hideNavigation = location.pathname === '/prompter' || location.pathname === '/login';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black"> {/* Changement ici */}
        <p className="dark:text-gray-200">Chargement...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${appSettings.isAppDarkMode ? 'dark' : ''} bg-gray-50 dark:bg-black`}> {/* Changement ici */}
      <Routes>
        <Route path="/login" element={<Login />} />
        {session ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/add" element={<SongForm />} />
            <Route path="/edit/:id" element={<SongForm />} />
            <Route path="/prompter" element={<Prompter />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/song/:id" element={<SongView />} />
          </>
        ) : (
          <Route path="*" element={<Login />} />
        )}
      </Routes>
      {!hideNavigation && <Navigation />}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SessionProvider>
        <AppProvider>
          <SongProvider>
            <AppContent />
          </SongProvider>
        </AppProvider>
      </SessionProvider>
    </BrowserRouter>
  );
}