import React, { useState } from 'react';
import { Settings, Trash2, DownloadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSongs } from '../context/SongContext';
import { SongCard } from '../components/SongCard';
import { CATEGORY_COLORS, SongCategory, Song } from '../types'; // Import de Song
import { ImportModal } from '../components/ImportModal';
import { ImportExportActions } from '../components/ImportExportActions';

interface CategorySectionProps {
  title: string;
  category: SongCategory;
  color: string;
  loading: boolean;
  searchQuery: string; // Ajout de la prop searchQuery
}

const CategorySection: React.FC<CategorySectionProps> = ({ title, category, color, loading, searchQuery }) => {
  const { songs } = useSongs();
  
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
    .sort((a, b) => a.title.localeCompare(b, 'fr'));

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold" style={{ color }}>
          {title}
        </h2>
        <span className="text-sm text-gray-500">
          {filteredSongs.length} chants
        </span>
      </div>
      {loading ? (
        <div className="text-center text-gray-500">Chargement des chants...</div>
      ) : filteredSongs.length === 0 ? (
        <div className="text-center text-gray-500">Aucun chant dans cette catégorie.</div>
      ) : (
        <div className="space-y-4">
          {filteredSongs.map(song => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}
    </section>
  );
};

export const Home = () => {
  const { selectedSongs, deleteSelectedSongs, clearSelection, songs, importSongs, deleteAllSongs, loadingSongs } = useSongs();
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportExportActions, setShowImportExportActions] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Nouvel état pour la recherche

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
    <div className="p-4 pb-20 safe-area-inset">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold truncate">CapoCanto</h1>
        <div className="flex space-x-2 ml-2">
          {selectedSongs.size > 0 && (
            <>
              <button
                onClick={handleDeleteSelected}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                title="Supprimer la sélection"
              >
                <Trash2 size={20} />
              </button>
              <button
                onClick={clearSelection}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              >
                Annuler
              </button>
            </>
          )}
          {songs.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full"
              title="Tout supprimer"
            >
              <Trash2 size={24} />
            </button>
          )}
          <button
            onClick={() => setShowImportExportActions(true)}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Actions d'import/export"
          >
            <DownloadCloud size={24} className="text-gray-600" />
          </button>
          <Link
            to="/settings"
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Settings size={24} className="text-gray-600" />
          </Link>
        </div>
      </div>

      <input
        type="text"
        placeholder="Rechercher un chant..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-6"
      />

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

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={importSongs}
      />

      <ImportExportActions
        isOpen={showImportExportActions}
        onClose={() => setShowImportExportActions(false)}
        onImportClick={() => setShowImportModal(true)}
        onExportClick={handleExport}
      />
    </div>
  );
};