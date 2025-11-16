import React from 'react';
import { Music, Edit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Song, CATEGORY_COLORS, VIVID_CATEGORY_COLORS, DARK_MODE_MUTED_CATEGORY_COLORS } from '../types'; // Import de DARK_MODE_MUTED_CATEGORY_COLORS
import { useSongs } from '../context/SongContext';
import { useSession } from '../context/SessionContext';
import { useAppContext } from '../context/AppContext'; // Import du nouveau contexte

interface SongCardProps {
  song: Song;
  showActions?: boolean;
}

export const SongCard: React.FC<SongCardProps> = ({ song, showActions = true }) => {
  const { selectedSongs, toggleSongSelection } = useSongs();
  const { userProfile } = useSession();
  const { appSettings } = useAppContext(); // Utilisation du nouveau contexte
  const isAdmin = userProfile?.role === 'admin';
  const navigate = useNavigate();
  const isSelected = selectedSongs.has(song.id);

  let bgColor: string;

  if (appSettings.isAppDarkMode) {
    if (appSettings.useVividColors) {
      bgColor = VIVID_CATEGORY_COLORS[song.category]; // Couleurs vives pour le mode sombre
    } else {
      bgColor = DARK_MODE_MUTED_CATEGORY_COLORS[song.category]; // Couleurs atténuées pour le mode sombre
    }
  } else { // Mode clair
    if (appSettings.useVividColors) {
      bgColor = VIVID_CATEGORY_COLORS[song.category]; // Couleurs vives pour le mode clair
    } else {
      bgColor = `${CATEGORY_COLORS[song.category]}15`; // Couleurs atténuées avec opacité pour le mode clair
    }
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    toggleSongSelection(song.id);
  };

  const handleCardClick = () => {
    navigate(`/song/${song.id}`);
  };

  return (
    <div 
      className={`rounded-lg shadow-md p-4 mb-4 relative cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } dark:text-gray-100`}
      style={{ backgroundColor: bgColor }}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          {isAdmin && (
            <div 
              className="mt-1"
              onClick={e => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold">{song.title}</h3>
            {song.mnemonic && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{song.mnemonic}</p>
            )}
          </div>
        </div>
        {/* Afficher le lien d'édition seulement pour les admins */}
        {showActions && isAdmin && (
          <Link
            to={`/edit/${song.id}`}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            onClick={e => e.stopPropagation()}
          >
            <Edit size={20} className="text-gray-600 dark:text-gray-300" />
          </Link>
        )}
      </div>
      {song.mediaLink && (
        <a
          href={song.mediaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 mt-2"
          onClick={e => e.stopPropagation()}
        >
          <Music size={16} className="mr-1" />
          Voir le média
        </a>
      )}
    </div>
  );
}