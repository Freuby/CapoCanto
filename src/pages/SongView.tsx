import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Music, Play, Pause } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSongs } from '../context/SongContext';
import { READING_FONT_SIZE, SongCategory } from '../types';
import { formatLyrics } from '../utils/songUtils';

const DEFAULT_BPM: Record<SongCategory, number> = {
  angola: 60,
  saoBentoPequeno: 85,
  saoBentoGrande: 120,
  sambaDeRoda: 90,
  maculele: 110,
  puxadaDeRede: 70,
  autre: 80,
};

export const SongView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { songs, prompterSettings } = useSongs();
  const song = songs.find((s) => s.id === id);

  const [isReading, setIsReading] = useState(false);
  const [bpm, setBpm] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0); // Position de défilement à la pause
  const [elapsedTimeAtPause, setElapsedTimeAtPause] = useState(0); // Temps écoulé à la pause

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameIdRef = useRef<number>(); // ID de l'animation
  const startTimeRef = useRef<number>(); // Timestamp du début de l'animation actuelle

  // Calcule la durée totale du défilement pour le chant entier
  const calculateTotalDuration = useCallback(() => {
    if (!scrollContainerRef.current || bpm === 0) return 0;
    const scrollHeight = scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight;
    // Formule ajustée pour que le BPM influence la durée totale du défilement
    return (scrollHeight / (bpm / 6)) * 200;
  }, [bpm]);

  useEffect(() => {
    if (song) {
      setBpm(DEFAULT_BPM[song.category]);
    }
  }, [song]);

  useEffect(() => {
    document.documentElement.classList.toggle('reading-mode', isReading);
    return () => {
      document.documentElement.classList.remove('reading-mode');
    };
  }, [isReading]);

  const stopScrolling = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = undefined;
    }
  }, []);

  const startScrolling = useCallback((initialScrollTop: number, initialElapsedTime: number) => {
    if (!scrollContainerRef.current) return;

    const scrollHeight = scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight;
    if (scrollHeight <= 0) { // Pas besoin de défiler si le contenu tient
      setIsReading(false);
      return;
    }

    const totalDuration = calculateTotalDuration();
    if (totalDuration === 0) { // Éviter la division par zéro ou un défilement infini
      setIsReading(false);
      return;
    }

    // Définir la position de défilement initiale
    scrollContainerRef.current.scrollTop = initialScrollTop;

    // Ajuster le temps de début pour tenir compte du temps déjà écoulé
    startTimeRef.current = performance.now() - initialElapsedTime;

    const animate = (currentTime: number) => {
      if (!startTimeRef.current || !scrollContainerRef.current) return;

      const elapsedTime = currentTime - startTimeRef.current;
      const progress = Math.min(elapsedTime / totalDuration, 1);

      scrollContainerRef.current.scrollTop = scrollHeight * progress;

      if (progress < 1) {
        animationFrameIdRef.current = requestAnimationFrame(animate);
      } else {
        // Défilement terminé
        setIsReading(false);
        scrollContainerRef.current.scrollTop = 0; // Réinitialiser en haut
        setScrollPosition(0); // Réinitialiser la position enregistrée
        setElapsedTimeAtPause(0); // Réinitialiser le temps écoulé
        stopScrolling(); // S'assurer que l'animation est annulée
      }
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);
  }, [calculateTotalDuration, stopScrolling]);

  const toggleReading = () => {
    if (isReading) {
      // Pause
      stopScrolling();
      setIsReading(false);
      // Enregistrer la position de défilement actuelle et le temps écoulé
      if (scrollContainerRef.current && startTimeRef.current) {
        setScrollPosition(scrollContainerRef.current.scrollTop);
        setElapsedTimeAtPause(performance.now() - startTimeRef.current);
      }
    } else {
      // Lecture / Reprise
      setIsReading(true);
      // Si le chant a été entièrement défilé, réinitialiser au début
      const isAtEnd = scrollContainerRef.current && 
                      scrollPosition >= (scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight - 1); // -1 pour la précision des flottants
      
      if (isAtEnd) {
        setScrollPosition(0);
        setElapsedTimeAtPause(0);
        startScrolling(0, 0);
      } else {
        startScrolling(scrollPosition, elapsedTimeAtPause);
      }
    }
  };

  // Effet pour arrêter le défilement lorsque le composant est démonté ou que le chant change
  useEffect(() => {
    return () => {
      stopScrolling();
      // Réinitialiser les états lors de la sortie de la vue du chant ou du changement de chant
      setIsReading(false);
      setScrollPosition(0);
      setElapsedTimeAtPause(0);
    };
  }, [id, stopScrolling]); // Dépend de l'ID pour réinitialiser lors de la navigation vers un autre chant

  // Effet pour redémarrer le défilement si le BPM change pendant la lecture
  useEffect(() => {
    if (isReading) {
      stopScrolling(); // Arrêter l'animation actuelle
      if (scrollContainerRef.current) {
        const currentScrollTop = scrollContainerRef.current.scrollTop;
        const scrollHeight = scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight;
        const newTotalDuration = calculateTotalDuration();

        if (scrollHeight > 0 && newTotalDuration > 0) {
          // Calculer le pourcentage de défilement effectué
          const progress = currentScrollTop / scrollHeight;
          // Calculer le nouveau temps écoulé basé sur cette progression et la nouvelle durée totale
          const newElapsedTime = progress * newTotalDuration;

          setElapsedTimeAtPause(newElapsedTime); // Mettre à jour l'état pour une reprise correcte si mis en pause plus tard
          startScrolling(currentScrollTop, newElapsedTime); // Redémarrer depuis la position actuelle avec la nouvelle vitesse
        } else {
          // Si le contenu est trop petit ou la durée est nulle, arrêter la lecture
          setIsReading(false);
          setScrollPosition(0);
          setElapsedTimeAtPause(0);
        }
      }
    }
  }, [bpm, isReading, startScrolling, stopScrolling, calculateTotalDuration]);


  if (!song) return null;

  const textColor = prompterSettings.isDarkMode ? 'text-white' : 'text-black';
  const bgColor = prompterSettings.isDarkMode ? 'bg-black' : 'bg-white';

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} safe-area-inset`}>
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 pt-safe-area pb-4 bg-inherit">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center space-x-4">
          {song.lyrics && !isReading && ( // Afficher le bouton Play uniquement si pas en mode lecture
            <button
              onClick={(e) => { e.stopPropagation(); toggleReading(); }}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Play size={24} />
            </button>
          )}
          {song.lyrics && isReading && ( // Afficher le curseur BPM uniquement si en mode lecture
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="30"
                max="150"
                step="10"
                value={bpm}
                onChange={(e) => {
                  setBpm(Number(e.target.value));
                }}
                className="w-24"
              />
              <span className="text-sm">{bpm} BPM</span>
            </div>
          )}
        </div>
      </div>

      {!isReading ? (
        <div className="p-4 pb-32">
          <h1 className="text-xl font-bold mb-6">{song.title}</h1>

          {song.mnemonic && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-gray-500 mb-2">
                Phrase mnémotechnique
              </h2>
              <p className="text-lg">{song.mnemonic}</p>
            </div>
          )}

          {song.lyrics && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-gray-500 mb-2">
                Paroles
              </h2>
              <pre
                className="whitespace-pre-wrap font-sans text-lg"
                dangerouslySetInnerHTML={{
                  __html: formatLyrics(song.lyrics, song.category),
                }}
              />
            </div>
          )}

          {song.mediaLink && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-gray-500 mb-2">Média</h2>
              <a
                href={song.mediaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {song.mediaLink}
              </a>
            </div>
          )}
        </div>
      ) : (
        <div ref={scrollContainerRef} className="h-screen overflow-hidden">
          <div className="min-h-full flex items-center justify-center p-4">
            <pre
              className="whitespace-pre-wrap font-sans text-center"
              style={{ fontSize: READING_FONT_SIZE }}
              dangerouslySetInnerHTML={{
                __html: formatLyrics(
                  prompterSettings.upperCase
                    ? song.lyrics?.toUpperCase() || ''
                    : song.lyrics || '',
                  song.category
                ),
              }}
            />
          </div>
        </div>
      )}

      {song.mediaLink && !isReading && (
        <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 p-4 bg-inherit border-t">
          <a
            href={song.mediaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 w-full py-3 bg-blue-600 text-white rounded-lg"
          >
            <Music size={20} />
            <span>Voir le média</span>
          </a>
        </div>
      )}
    </div>
  );
};