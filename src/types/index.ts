export type SongCategory = 'angola' | 'saoBentoPequeno' | 'saoBentoGrande' | 'sambaDeRoda' | 'maculele' | 'puxadaDeRede' | 'autre';

export type UserRole = 'user' | 'admin'; // Nouveau type pour les rôles

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: UserRole; // Ajout du rôle au profil
  updated_at: string;
}

export interface Song {
  id: string;
  title: string;
  category: SongCategory;
  mnemonic?: string;
  lyrics?: string;
  mediaLink?: string;
  user_id: string; // Ajouté pour la liaison avec l'utilisateur Supabase
  created_at: string; // Ajouté pour la date de création
  updated_at: string; // Ajouté pour la date de dernière modification
}

export interface PrompterSettings {
  rotationInterval: number;
  fontSize: 'small' | 'medium' | 'large';
  isDarkMode: boolean; // Ce paramètre reste pour le prompteur uniquement
  useHighContrast: boolean;
  upperCase: boolean;
}

export interface AppSettings { // Nouveaux paramètres d'application globaux
  isAppDarkMode: boolean;
  useVividColors: boolean;
}

export const CATEGORY_COLORS = {
  angola: '#E8DF24',
  saoBentoPequeno: '#03A501',
  saoBentoGrande: '#0467B0',
  sambaDeRoda: '#FF6347', // Tomato
  maculele: '#8A2BE2', // BlueViolet
  puxadaDeRede: '#FFD700', // Gold
  autre: '#A9A9A9', // DarkGray
} as const;

export const VIVID_CATEGORY_COLORS = { // Couleurs vives pour les tuiles
  angola: '#FFD700', // Gold
  saoBentoPequeno: '#32CD32', // LimeGreen
  saoBentoGrande: '#1E90FF', // DodgerBlue
  sambaDeRoda: '#FF4500', // OrangeRed
  maculele: '#9932CC', // DarkOrchid
  puxadaDeRede: '#FFC107', // Amber
  autre: '#778899', // LightSlateGray
} as const;

export const FONT_SIZES = {
  small: '1.5rem',
  medium: '2rem',
  large: '2.5rem',
} as const;

export const READING_FONT_SIZE = '4.5rem';