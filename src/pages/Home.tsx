import React, { useState } from 'react';
import { Settings, Trash2, DownloadCloud, Search, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSongs } from '../context/SongContext';
import { useSession } from '../context/SessionContext'; // Import de useSession
import { SongCard } from '../components/SongCard';
import { CATEGORY_COLORS, SongCategory } from '../types';
import { ImportModal } from '../components/ImportModal';
import { ImportExportActions } from '../components/ImportExportActions';

interface CategorySectionProps {
  title: string;
  category: SongCategory;
  color: string;
  loading: boolean;
  searchQuery: string;
}

const CategorySection: React.FC<CategorySectionProps> = ({ title, category, color, loading, searchQuery }) => {
  const { songs } = useSongs();
  const [isExpanded, setIsExpanded] = useState(true); // État pour gérer le dépliage/pliage

  const filteredSongs = songs
    .filter(song => song.category === category)
    .filter(song => {
      const query = searchQuery.toLowerCase();
      return (
        song.title.toLowerCase().includes(query) ||
        (song.mnemonic && song.mnemonic.toLowerCase().includes(query)) ||
        (song.lyrics && song.lyrics.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => a.title.localeCompare(b.title, 'fr'));

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="flex items-center space-x-2 focus:outline-none"
        >
          <ChevronDown size={20} className={`transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} style={{ color }} />
          <h2 className="text-xl font-bold" style={{ color }}>
            {title}
          </h2>
        </button>
        <span className="text-sm text-gray-500">
          {filteredSongs.length} chants
        </span>
      </div>
      {isExpanded && ( // Afficher le contenu seulement si isExpanded est vrai
        loading ? (
          <div className="text-center text-gray-500">Chargement des chants...</div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center text-gray-500">Aucun chant dans cette catégorie.</div>
        ) : (
          <div className="space-y-4">
            {filteredSongs.map(song => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )
      )}
    </section>
  );
};

export const Home = () => {
  const { selectedSongs, deleteSelectedSongs, clearSelection, songs, importSongs, deleteAllSongs, loadingSongs } = useSongs();
  const { userProfile } = useSession(); // Récupération du profil utilisateur
  const isAdmin = userProfile?.role === 'admin'; // Vérification du rôle admin

  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportExportActions, setShowImportExportActions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);

  const handleDeleteSelected = () => {
    if (window.confirm(`Voulez-vous vraiment supprimer ${selectedSongs.size} chant(s) ?`)) {
      deleteSelectedSongs();
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm('⚠️ Voulez-vous vraiment supprimer TOUS les chants ?')) {
      if (window.confirm('Cette action est irréversible. Êtes-vous vraiment sûr ?')) {
        deleteAllSongs();
      }
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['title', 'category', 'mnemonic', 'lyrics', 'mediaLink'].join(','),
      ...songs.map(song => [
        `"${song.title.replace(/"/g, '""')}"`,
        song.category,
        `"${(song.mnemonic || '').replace(/"/g, '""')}"`,
        `"${(song.lyrics || '').replace(/"/g, '""')}"`,
        `"${(song.mediaLink || '').replace(/"/g, '""')}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'chants-capoeira.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50"> {/* Ajout d'un conteneur principal pour le défilement */}
      <div className="sticky top-0 bg-black z-50 px-4 pt-safe-area pb-4"> {/* En-tête fixe */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold truncate text-white">CapoCanto</h1>
          <div className="flex space-x-2 ml-2">
            {isAdmin && selectedSongs.size > 0 && ( // Afficher seulement pour les admins
              <>
                <button
                  onClick={handleDeleteSelected}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  title="Supprimer la sélection"
                >
                  <Trash2 size={20} />
                </button>
                <button
                  onClick={clearSelection}
                  className="p-2 text-white hover:bg-gray-700 rounded-full"
                >
                  Annuler
                </button>
              </>
            )}
            {isAdmin && songs.length > 0 && ( // Afficher seulement pour les admins
              <button
                onClick={handleDeleteAll}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                title="Tout supprimer"
              >
                <Trash2 size={24} />
              </button>
            )}
            {isAdmin && ( // Afficher seulement pour les admins
              <button
                onClick={() => setShowImportExportActions(true)}
                className="p-2 hover:bg-gray-700 rounded-full"
                title="Actions d'import/export"
              >
                <DownloadCloud size={24} className="text-white" />
              </button>
            )}
            <button
              onClick={() => setShowSearchBar(prev => !prev)}
              className="p-2 hover:bg-gray-700 rounded-full"
              title="Rechercher"
            >
              <Search size={24} className="text-white" />
            </button>
            <Link
              to="/settings"
              className="p-2 hover:bg-gray-700 rounded-full"
            >
              <Settings size={24} className="text-white" />
            </Link>
          </div>
        </div>

        {showSearchBar && (
          <input
            type="text"
            placeholder="Rechercher un chant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 mt-4"
          />
        )}
      </div>

      <div className="px-4 pt-4 pb-20 safe-area-inset-bottom"> {/* Contenu principal avec padding ajusté */}
        <CategorySection
          title="Angola"
          category="angola"
          color={CATEGORY_COLORS.angola}
          loading={loadingSongs}
          searchQuery={searchQuery}
        />
        <CategorySection
          title="São Bento Pequeno"
          category="saoBentoPequeno"
          color={CATEGORY_COLORS.saoBentoPequeno}
          loading={loadingSongs}
          searchQuery={searchQuery}
        />
        <CategorySection
          title="São Bento Grande"
          category="saoBentoGrande"
          color={CATEGORY_COLORS.saoBentoGrande}
          loading={loadingSongs}
          searchQuery={searchQuery}
        />
        <CategorySection
          title="Samba de roda"
          category="sambaDeRoda"
          color={CATEGORY_COLORS.sambaDeRoda}
          loading={loadingSongs}
          searchQuery={searchQuery}
        />
        <CategorySection
          title="Maculêlê"
          category="maculele"
          color={CATEGORY_COLORS.maculele}
          loading={loadingSongs}
          searchQuery={searchQuery}
        />
        <CategorySection
          title="Puxada de rede"
          category="puxadaDeRede"
          color={CATEGORY_COLORS.puxadaDeRede}
          loading={loadingSongs}
          searchQuery={searchQuery}
        />
        <CategorySection
          title="Autre"
          category="autre"
          color={CATEGORY_COLORS.autre}
          loading={loadingSongs}
          searchQuery={searchQuery}
        />
      </div>

      {isAdmin && ( // Afficher seulement pour les admins
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={importSongs}
        />
      )}

      {isAdmin && ( // Afficher seulement pour les admins
        <ImportExportActions
          isOpen={showImportExportActions}
          onClose={() => setShowImportExportActions(false)}
          onImportClick={() => setShowImportModal(true)}
          onExportClick={handleExport}
        />
      )}
    </div>
  );
};