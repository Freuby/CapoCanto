import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Song, PrompterSettings, SongCategory } from '../types';
import { supabase } from '../integrations/supabase/client';
import { useSession } from './SessionContext';
import { showSuccess, showError, showLoading, dismissToast } from '../utils/toast';

interface SongContextType {
  songs: Song[];
  addSong: (song: Omit<Song, 'id' | 'user_id'>) => Promise<void>;
  editSong: (song: Song) => Promise<void>;
  deleteSong: (id: string) => Promise<void>;
  deleteAllSongs: () => Promise<void>;
  getRandomSongByCategory: (category: SongCategory) => Song | null;
  prompterSettings: PrompterSettings;
  updatePrompterSettings: (settings: Partial<PrompterSettings>) => void;
  selectedSongs: Set<string>;
  toggleSongSelection: (id: string) => void;
  clearSelection: () => void;
  deleteSelectedSongs: () => Promise<void>;
  importSongs: (songs: Array<Omit<Song, 'id' | 'user_id'>>) => Promise<void>;
  loadingSongs: boolean;
}

const defaultSettings: PrompterSettings = {
  rotationInterval: 120,
  fontSize: 'medium',
  isDarkMode: true,
  useHighContrast: false,
  upperCase: false,
};

const SongContext = createContext<SongContextType | null>(null);

export const SongProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: sessionLoading } = useSession();
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [prompterSettings, setPrompterSettings] = useState<PrompterSettings>(() => {
    const saved = localStorage.getItem('prompterSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  const [loadingSongs, setLoadingSongs] = useState(true);

  // Save prompter settings to localStorage
  useEffect(() => {
    localStorage.setItem('prompterSettings', JSON.stringify(prompterSettings));
  }, [prompterSettings]);

  const fetchSongs = useCallback(async () => {
    if (!user) {
      setSongs([]);
      setLoadingSongs(false);
      return;
    }

    setLoadingSongs(true);
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching songs:', error);
      showError('Erreur lors du chargement des chants.');
      setSongs([]);
    } else {
      setSongs(data || []);
    }
    setLoadingSongs(false);
  }, [user]);

  // Initial fetch and localStorage migration
  useEffect(() => {
    if (!sessionLoading && user) {
      const migrateSongs = async () => {
        const localSongsString = localStorage.getItem('capoeiraSongs');
        const localSongs: Omit<Song, 'user_id'>[] = localSongsString ? JSON.parse(localSongsString) : [];

        if (localSongs.length > 0) {
          const { data: existingSupabaseSongs, error: fetchError } = await supabase
            .from('songs')
            .select('id')
            .eq('user_id', user.id);

          if (fetchError) {
            console.error('Error checking existing Supabase songs:', fetchError);
            showError('Erreur lors de la vérification des chants existants.');
          } else if (!existingSupabaseSongs || existingSupabaseSongs.length === 0) {
            // Only migrate if no songs exist for the user in Supabase
            const toastId = showLoading('Migration des chants locaux...');
            const songsToInsert = localSongs.map(song => ({
              ...song,
              user_id: user.id,
              id: song.id || crypto.randomUUID(), // Ensure ID is present for migration
            }));

            const { error: insertError } = await supabase
              .from('songs')
              .insert(songsToInsert);

            if (insertError) {
              console.error('Error migrating songs:', insertError);
              showError('Erreur lors de la migration des chants locaux.');
            } else {
              showSuccess('Chants locaux migrés avec succès !');
              localStorage.removeItem('capoeiraSongs'); // Clear local storage after successful migration
            }
            dismissToast(toastId);
          }
        }
        fetchSongs(); // Always fetch after potential migration
      };
      migrateSongs();
    } else if (!sessionLoading && !user) {
      setSongs([]); // Clear songs if no user is logged in
      setLoadingSongs(false);
    }
  }, [sessionLoading, user, fetchSongs]);

  const addSong = async (song: Omit<Song, 'id' | 'user_id'>) => {
    if (!user) {
      showError('Vous devez être connecté pour ajouter un chant.');
      return;
    }
    const toastId = showLoading('Ajout du chant...');
    const newSong = { ...song, user_id: user.id };
    const { data, error } = await supabase
      .from('songs')
      .insert(newSong)
      .select()
      .single();

    if (error) {
      console.error('Error adding song:', error);
      showError(`Erreur lors de l'ajout du chant: ${error.message}`);
    } else {
      setSongs(prev => [...prev, data]);
      showSuccess('Chant ajouté avec succès !');
    }
    dismissToast(toastId);
  };

  const editSong = async (song: Song) => {
    if (!user || song.user_id !== user.id) {
      showError('Vous n\'êtes pas autorisé à modifier ce chant.');
      return;
    }
    const toastId = showLoading('Modification du chant...');
    const { data, error } = await supabase
      .from('songs')
      .update(song)
      .eq('id', song.id)
      .select()
      .single();

    if (error) {
      console.error('Error editing song:', error);
      showError(`Erreur lors de la modification du chant: ${error.message}`);
    } else {
      setSongs(prev => prev.map(s => s.id === song.id ? data : s));
      showSuccess('Chant modifié avec succès !');
    }
    dismissToast(toastId);
  };

  const deleteSong = async (id: string) => {
    if (!user) {
      showError('Vous devez être connecté pour supprimer un chant.');
      return;
    }
    const toastId = showLoading('Suppression du chant...');
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting song:', error);
      showError(`Erreur lors de la suppression du chant: ${error.message}`);
    } else {
      setSongs(prev => prev.filter(s => s.id !== id));
      setSelectedSongs(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      showSuccess('Chant supprimé avec succès !');
    }
    dismissToast(toastId);
  };

  const deleteAllSongs = async () => {
    if (!user) {
      showError('Vous devez être connecté pour supprimer des chants.');
      return;
    }
    const toastId = showLoading('Suppression de tous les chants...');
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting all songs:', error);
      showError(`Erreur lors de la suppression de tous les chants: ${error.message}`);
    } else {
      setSongs([]);
      setSelectedSongs(new Set());
      showSuccess('Tous les chants ont été supprimés !');
    }
    dismissToast(toastId);
  };

  const toggleSongSelection = (id: string) => {
    setSelectedSongs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedSongs(new Set());
  };

  const deleteSelectedSongs = async () => {
    if (!user) {
      showError('Vous devez être connecté pour supprimer des chants.');
      return;
    }
    if (selectedSongs.size === 0) return;

    const toastId = showLoading(`Suppression de ${selectedSongs.size} chant(s)...`);
    const { error } = await supabase
      .from('songs')
      .delete()
      .in('id', Array.from(selectedSongs))
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting selected songs:', error);
      showError(`Erreur lors de la suppression des chants sélectionnés: ${error.message}`);
    } else {
      setSongs(prev => prev.filter(song => !selectedSongs.has(song.id)));
      clearSelection();
      showSuccess('Chant(s) sélectionné(s) supprimé(s) avec succès !');
    }
    dismissToast(toastId);
  };

  const importSongs = async (newSongs: Array<Omit<Song, 'id' | 'user_id'>>) => {
    if (!user) {
      showError('Vous devez être connecté pour importer des chants.');
      return;
    }
    if (newSongs.length === 0) return;

    const toastId = showLoading(`Importation de ${newSongs.length} chant(s)...`);
    const songsToInsert = newSongs.map(song => ({
      ...song,
      user_id: user.id,
    }));

    const { data, error } = await supabase
      .from('songs')
      .insert(songsToInsert)
      .select();

    if (error) {
      console.error('Error importing songs:', error);
      showError(`Erreur lors de l'importation des chants: ${error.message}`);
    } else {
      setSongs(prev => [...prev, ...data]);
      showSuccess('Chants importés avec succès !');
    }
    dismissToast(toastId);
  };

  const getRandomSongByCategory = (category: SongCategory) => {
    const categorySongs = songs.filter(s => s.category === category);
    if (categorySongs.length === 0) return null;
    return categorySongs[Math.floor(Math.random() * categorySongs.length)];
  };

  const updatePrompterSettings = (settings: Partial<PrompterSettings>) => {
    setPrompterSettings(prev => ({ ...prev, ...settings }));
  };

  return (
    <SongContext.Provider value={{
      songs,
      addSong,
      editSong,
      deleteSong,
      deleteAllSongs,
      getRandomSongByCategory,
      prompterSettings,
      updatePrompterSettings,
      selectedSongs,
      toggleSongSelection,
      clearSelection,
      deleteSelectedSongs,
      importSongs,
      loadingSongs,
    }}>
      {children}
    </SongContext.Provider>
  );
};

export const useSongs = () => {
  const context = useContext(SongContext);
  if (!context) throw new Error('useSongs must be used within a SongProvider');
  return context;
};