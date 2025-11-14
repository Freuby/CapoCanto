import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Song, PrompterSettings, SongCategory } from '../types';
import { supabase } from '../integrations/supabase/client';
import { useSession } from './SessionContext'; // Import de useSession

interface SongContextType {
  songs: Song[];
  addSong: (song: Omit<Song, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  editSong: (song: Song) => void;
  deleteSong: (id: string) => void;
  deleteAllSongs: () => void;
  getRandomSongByCategory: (category: SongCategory) => Song | null;
  prompterSettings: PrompterSettings;
  updatePrompterSettings: (settings: Partial<PrompterSettings>) => void;
  selectedSongs: Set<string>;
  toggleSongSelection: (id: string) => void;
  clearSelection: () => void;
  deleteSelectedSongs: () => void;
  importSongs: (songs: Array<Omit<Song, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => void;
  loadingSongs: boolean; // Ajout de l'état de chargement
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
  const { session, loading: sessionLoading } = useSession();
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [prompterSettings, setPrompterSettings] = useState<PrompterSettings>(() => {
    const saved = localStorage.getItem('prompterSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  const [loadingSongs, setLoadingSongs] = useState(true);

  // Charger les paramètres du prompteur depuis localStorage
  useEffect(() => {
    localStorage.setItem('prompterSettings', JSON.stringify(prompterSettings));
  }, [prompterSettings]);

  // Fonction pour récupérer les chants depuis Supabase
  const fetchSongs = useCallback(async () => {
    if (!session?.user) {
      setSongs([]);
      setLoadingSongs(false);
      return;
    }

    setLoadingSongs(true);
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('user_id', session.user.id)
      .order('title', { ascending: true });

    if (error) {
      console.error('Erreur lors du chargement des chants:', error);
      setSongs([]);
    } else {
      setSongs(data as Song[]);
    }
    setLoadingSongs(false);
  }, [session]);

  // Charger les chants au montage du composant ou lorsque la session change
  useEffect(() => {
    if (!sessionLoading) {
      fetchSongs();
    }
  }, [sessionLoading, session, fetchSongs]);

  const addSong = async (song: Omit<Song, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('songs')
      .insert({ ...song, user_id: session.user.id })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de l\'ajout du chant:', error);
    } else if (data) {
      setSongs(prev => [...prev, data as Song]);
    }
  };

  const editSong = async (song: Song) => {
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('songs')
      .update(song)
      .eq('id', song.id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la modification du chant:', error);
    } else if (data) {
      setSongs(prev => prev.map(s => s.id === data.id ? data as Song : s));
    }
  };

  const deleteSong = async (id: string) => {
    if (!session?.user) return;

    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Erreur lors de la suppression du chant:', error);
    } else {
      setSongs(prev => prev.filter(s => s.id !== id));
      setSelectedSongs(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const deleteAllSongs = async () => {
    if (!session?.user) return;

    if (window.confirm('⚠️ Voulez-vous vraiment supprimer TOUS les chants ?')) {
      if (window.confirm('Cette action est irréversible. Êtes-vous vraiment sûr ?')) {
        const { error } = await supabase
          .from('songs')
          .delete()
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Erreur lors de la suppression de tous les chants:', error);
        } else {
          setSongs([]);
          setSelectedSongs(new Set());
        }
      }
    }
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
    if (!session?.user || selectedSongs.size === 0) return;

    if (window.confirm(`Voulez-vous vraiment supprimer ${selectedSongs.size} chant(s) ?`)) {
      const { error } = await supabase
        .from('songs')
        .delete()
        .in('id', Array.from(selectedSongs))
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Erreur lors de la suppression des chants sélectionnés:', error);
      } else {
        setSongs(prev => prev.filter(song => !selectedSongs.has(song.id)));
        clearSelection();
      }
    }
  };

  const importSongs = async (newSongs: Array<Omit<Song, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!session?.user || newSongs.length === 0) return;

    const songsToInsert = newSongs.map(song => ({
      ...song,
      user_id: session.user.id
    }));

    const { data, error } = await supabase
      .from('songs')
      .insert(songsToInsert)
      .select();

    if (error) {
      console.error('Erreur lors de l\'importation des chants:', error);
    } else if (data) {
      setSongs(prev => [...prev, ...(data as Song[])]);
    }
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