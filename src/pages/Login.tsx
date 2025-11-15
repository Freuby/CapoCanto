import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';
import { useAppContext } from '../context/AppContext'; // Import du contexte pour le mode sombre

export const Login = () => {
  const { appSettings } = useAppContext(); // Utilisation du contexte pour le mode sombre
  const authTheme = appSettings.isAppDarkMode ? ThemeSupa : ThemeSupa; // ThemeSupa est déjà adaptatif, mais on peut le forcer si besoin
  const authColorScheme = appSettings.isAppDarkMode ? 'dark' : 'light';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 dark:text-gray-100">Connexion à CapoCanto</h1>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: authTheme,
            variables: {
              default: {
                colors: {
                  brand: '#0467B0',
                  brandAccent: '#03A501',
                  // Ajustements pour le mode sombre si ThemeSupa ne suffit pas
                  // inputBackground: appSettings.isAppDarkMode ? '#4B5563' : '#FFFFFF', // bg-gray-600
                  // inputBorder: appSettings.isAppDarkMode ? '#6B7280' : '#D1D5DB', // border-gray-500
                  // inputTextColor: appSettings.isAppDarkMode ? '#F3F4F6' : '#1F2937', // text-gray-100
                },
              },
            },
          }}
          theme={authColorScheme} // Thème dynamique
          localization={{
            variables: {
              sign_in: {
                email_label: 'Adresse e-mail',
                password_label: 'Mot de passe',
                email_input_placeholder: 'Votre adresse e-mail',
                password_input_placeholder: 'Votre mot de passe',
                button_label: 'Se connecter',
                social_provider_text: 'Se connecter avec {{provider}}',
                link_text: 'Déjà un compte ? Connectez-vous',
              },
              sign_up: {
                email_label: 'Adresse e-mail',
                password_label: 'Mot de passe',
                email_input_placeholder: 'Votre adresse e-mail',
                password_input_placeholder: 'Votre mot de passe',
                button_label: 'S\'inscrire',
                social_provider_text: 'S\'inscrire avec {{provider}}',
                link_text: 'Pas encore de compte ? Inscrivez-vous',
              },
              forgotten_password: {
                email_label: 'Adresse e-mail',
                password_label: 'Votre mot de passe',
                email_input_placeholder: 'Votre adresse e-mail',
                button_label: 'Envoyer les instructions de réinitialisation',
                link_text: 'Mot de passe oublié ?',
              },
              update_password: {
                password_label: 'Nouveau mot de passe',
                password_input_placeholder: 'Votre nouveau mot de passe',
                button_label: 'Mettre à jour le mot de passe',
              },
            },
          }}
        />
      </div>
    </div>
  );
};