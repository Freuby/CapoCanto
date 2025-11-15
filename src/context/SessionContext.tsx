import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';

interface SessionContextType {
  session: Session | null;
  loading: boolean;
  userRole: 'admin' | 'user' | null; // Ajout du rôle de l'utilisateur
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null); // État pour le rôle
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserRole = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du rôle utilisateur:', error);
        return null;
      }
      return data?.role || 'user'; // Par défaut 'user' si non trouvé
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) {
        const role = await fetchUserRole(currentSession.user.id);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      setLoading(false);

      if (currentSession) {
        // User is logged in, redirect to home if on login page
        if (location.pathname === '/login') {
          navigate('/');
        }
      } else {
        // User is logged out, redirect to login page if not already there
        if (location.pathname !== '/login') {
          navigate('/login');
        }
      }
    });

    // Fetch initial session
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession?.user) {
        const role = await fetchUserRole(initialSession.user.id);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      setLoading(false);
      if (initialSession && location.pathname === '/login') {
        navigate('/');
      } else if (!initialSession && location.pathname !== '/login') {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  return (
    <SessionContext.Provider value={{ session, loading, userRole }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};