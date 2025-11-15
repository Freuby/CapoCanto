import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SongProvider } from './context/SongContext';
import { SessionProvider, useSession } from './context/SessionContext'; // Import SessionProvider and useSession
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { SongForm } from './pages/SongForm';
import { Prompter } from './pages/Prompter';
import { Settings } from './pages/Settings';
import { SongView } from './pages/SongView';
import { Login } from './pages/Login'; // Import Login page

const AppContent = () => {
  const location = useLocation();
  const { session, loading, isAdmin } = useSession(); // Use session and isAdmin from context
  const hideNavigation = location.pathname === '/prompter' || location.pathname === '/login';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={<Login />} />
        {session ? (
          <>
            <Route path="/" element={<Home />} />
            {isAdmin ? ( // Admin-only routes
              <>
                <Route path="/add" element={<SongForm />} />
                <Route path="/edit/:id" element={<SongForm />} />
              </>
            ) : (
              // Redirect non-admin users from admin routes
              <>
                <Route path="/add" element={<Home />} />
                <Route path="/edit/:id" element={<Home />} />
              </>
            )}
            <Route path="/prompter" element={<Prompter />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/song/:id" element={<SongView />} />
          </>
        ) : (
          <Route path="*" element={<Login />} /> // Redirect all unauthenticated users to login
        )}
      </Routes>
      {!hideNavigation && <Navigation />}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SessionProvider> {/* Wrap with SessionProvider */}
        <SongProvider>
          <AppContent />
        </SongProvider>
      </SessionProvider>
    </BrowserRouter>
  );
}