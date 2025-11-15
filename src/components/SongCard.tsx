import React from 'react';
import { Music, Edit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Song, CATEGORY_COLORS, VIVID_CATEGORY_COLORS } from '../types';
import { useSongs } from '../context/SongContext';
import { useSession } from '../context/SessionContext';
import { useAppContext } from '../context/AppContext';

interface SongCardProps {
  song: Song;
  showActions?: boolean;
}

export const SongCard: React.FC<SongCardProps> = ({ song, showActions = true }) => {
  const { selectedSongs, toggleSongSelection } = useSongs();
  const { userProfile } = useSession();
  const { appSettings } = useAppContext();
  const isAdmin = userProfile?.role === 'admin';
  const navigate = useNavigate();
  const isSelected = selectedSongs.has(song.id);

  const { isAppDarkMode, useVividColors } = appSettings;

  let cardBgStyle: React.CSSProperties = {};
  let cardClasses = `rounded-lg shadow-md p-4 mb-4 relative cursor-pointer ${
    isSelected ? 'ring-2 ring-blue-500' : ''
  }`;
  let titleTextColorClass = '';
  let mnemonicTextColorClass = '';
  let mediaLinkTextColorClass = '';
  let iconColorClass = '';
  let checkboxClasses = '';

  if (useVividColors) {
    cardBgStyle.backgroundColor = VIVID_CATEGORY_COLORS[song.category];
    titleTextColorClass = 'text-white';
    mnemonicTextColorClass = 'text-gray-200';
    mediaLinkTextColorClass = 'text-blue-200';
    iconColorClass = 'text-gray-200';
    checkboxClasses = 'border-gray-300 text-blue-600 focus:ring-blue-500 bg-gray-700'; // Checkbox visible sur fond vif
  } else {
    if (isAppDarkMode) {
      cardClasses += ' bg-gray-800 border-l-4'; // Utilise une classe Tailwind pour le fond
      cardBgStyle.borderColor = CATEGORY_COLORS[song.category]; // Couleur de la catégorie pour la bordure
      titleTextColorClass = 'text-gray-100';
      mnemonicTextColorClass = 'text-gray-300';
      mediaLinkTextColorClass = 'text-blue-400';
      iconColorClass = 'text-gray-300';
      checkboxClasses = 'border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700';
    } else {
      cardBgStyle.backgroundColor = `${CATEGORY_COLORS[song.category]}15`; // Teinte claire pour le mode clair
      titleTextColorClass = 'text-gray-900';
      mnemonicTextColorClass = 'text-gray-600';
      mediaLinkTextColorClass = 'text-blue-600';
      iconColorClass = 'text-gray-600';
      checkboxClasses = 'border-gray-300 text-blue-600 focus:ring-blue-500 bg-white';
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
      className={`${cardClasses} ${isAppDarkMode && !useVividColors ? '' : 'dark:text-gray-100'}`} // dark:text-gray-100 est géré par titleTextColorClass
      style={cardBgStyle}
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
                className={`h-4 w-4 rounded ${checkboxClasses}`}
              />
            </div>
          )}
          <div>
            <h3 className={`text-lg font-semibold ${titleTextColorClass}`}>{song.title}</h3>
            {song.mnemonic && (
              <p className={`text-sm mt-1 ${mnemonicTextColorClass}`}>{song.mnemonic}</p>
            )}
          </div>
        </div>
        {showActions && (
          <Link
            to={`/edit/${song.id}`}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            onClick={e => e.stopPropagation()}
          >
            <Edit size={20} className={iconColorClass} />
          </Link>
        )}
      </div>
      {song.mediaLink && (
        <a
          href={song.mediaLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center text-sm mt-2 ${mediaLinkTextColorClass}`}
          onClick={e => e.stopPropagation()}
        >
          <Music size={16} className={`mr-1 ${iconColorClass}`} />
          Voir le média
        </a>
      )}
    </div>
  );
}