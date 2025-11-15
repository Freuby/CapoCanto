import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { Profile } from '../types'; // Import du type Profile

interface SessionContextType {
  session: Session | null;
  loading: boolean;
  userProfile: Profile | null; // Ajout du profil utilisateur
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null); // État pour le profil
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération du profil utilisateur:', error);
      setUserProfile(null);
    } else {
      setUserProfile(data as Profile);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setLoading(false);

      if (currentSession) {
        fetchUserProfile(currentSession.user.id); // Récupérer le profil lors de la connexion
        if (location.pathname === '/login') {
          navigate('/');
        }
      } else {
        setUserProfile(null); // Effacer le profil lors de la déconnexion
        if (location.pathname !== '/login') {
          navigate('/login');
        }
      }
    });

    // Récupérer la session initiale et le profil
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setLoading(false);
      if (initialSession) {
        await fetchUserProfile(initialSession.user.id); // Récupérer le profil pour la session initiale
        if (location.pathname === '/login') {
          navigate('/');
        }
      } else if (!initialSession && location.pathname !== '/login') {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname, fetchUserProfile]);

  return (
    <SessionContext.Provider value={{ session, loading, userProfile }}>
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