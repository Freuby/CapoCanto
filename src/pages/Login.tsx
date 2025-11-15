import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';

export const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Connexion à CapoCanto</h1>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#0467B0',
                  brandAccent: '#03A501',
                },
              },
            },
          }}
          theme="light"
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