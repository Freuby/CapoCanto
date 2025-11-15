import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash } from 'lucide-react';
import { useSongs } from '../context/SongContext';
import { useSession } from '../context/SessionContext'; // Import de useSession
import { Song, SongCategory, CATEGORY_COLORS } from '../types';

// Ajustement du type pour initialSong pour correspondre à ce qui est passé à addSong
const initialSong: Omit<Song, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  title: '',
  category: 'angola',
  mnemonic: '',
  lyrics: '',
  mediaLink: '',
};

export const SongForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { songs, addSong, editSong, deleteSong } = useSongs();
  const { userProfile } = useSession(); // Récupération du profil utilisateur
  const isAdmin = userProfile?.role === 'admin'; // Vérification du rôle admin
  // Le type de formData doit correspondre à initialSong
  const [formData, setFormData] = useState<Omit<Song, 'id' | 'user_id' | 'created_at' | 'updated_at'>>(initialSong);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (id) {
      const song = songs.find(s => s.id === id);
      if (song) {
        // Lors de l'édition, nous avons un objet Song complet, mais formData ne gère pas id, user_id, created_at, updated_at
        // Nous devons donc omettre ces propriétés lors de la mise à jour de formData
        const { id: songId, user_id, created_at, updated_at, ...rest } = song;
        setFormData(rest);
      }
    }
  }, [id, songs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title && !formData.mnemonic) {
      setError('Le titre ou la phrase mnémotechnique est obligatoire');
      return;
    }
    
    setError('');
    if (id) {
      // Lors de l'édition, nous devons inclure l'id, user_id, created_at, updated_at
      const existingSong = songs.find(s => s.id === id);
      if (existingSong) {
        editSong({ ...formData, id, user_id: existingSong.user_id, created_at: existingSong.created_at, updated_at: existingSong.updated_at });
      }
    } else {
      addSong(formData);
    }
    navigate('/');
  };

  const handleDelete = () => {
    if (id && window.confirm('Voulez-vous vraiment supprimer ce chant ?')) {
      deleteSong(id);
      navigate('/');
    }
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-6 pt-safe-area"> {/* Ajout de pt-safe-area ici */}
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">
          {id ? 'Modifier le chant' : 'Ajouter un chant'}
        </h1>
        <div className="w-10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Catégorie
          </label>
          <select
            value={formData.category}
            onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as SongCategory }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            style={{ backgroundColor: `${CATEGORY_COLORS[formData.category]}15` }}
          >
            <option value="angola">Angola</option>
            <option value="saoBentoPequeno">São Bento Pequeno</option>
            <option value="saoBentoGrande">São Bento Grande</option>
            <option value="sambaDeRoda">Samba de roda</option>
            <option value="maculele">Maculêlê</option>
            <option value="puxadaDeRede">Puxada de rede</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phrase mnémotechnique
          </label>
          <input
            type="text"
            value={formData.mnemonic || ''}
            onChange={e => setFormData(prev => ({ ...prev, mnemonic: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Le titre ou la phrase mnémotechnique est obligatoire
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paroles
          </label>
          <textarea
            value={formData.lyrics || ''}
            onChange={e => setFormData(prev => ({ ...prev, lyrics: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lien média
          </label>
          <input
            type="url"
            value={formData.mediaLink || ''}
            onChange={e => setFormData(prev => ({ ...prev, mediaLink: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
          >
            <Save size={20} />
            <span>Enregistrer</span>
          </button>
          {id && isAdmin && ( // Afficher le bouton de suppression seulement pour les admins
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-3 text-red-600 border border-red-600 rounded-lg font-medium flex items-center justify-center"
            >
              <Trash size={20} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};