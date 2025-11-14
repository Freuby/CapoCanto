import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Music, Play, Pause } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSongs } from '../context/SongContext';
import { CATEGORY_COLORS, READING_FONT_SIZE, SongCategory } from '../types'; // Ajout de SongCategory

const DEFAULT_BPM: Record<SongCategory, number> = { // Typage de DEFAULT_BPM
  angola: 60,
  saoBentoPequeno: 85,
  saoBentoGrande: 120,
  sambaDeRoda: 90, // Ajout des nouvelles catégories
  maculele: 110,
  puxadaDeRede: 70,
  autre: 80,
};

const formatLyrics = (lyrics: string, category: SongCategory) => { // Typage de category
  return lyrics
    .split('\n')
    .map((line, _index) => { // _index pour marquer comme inutilisé
      if (line.toLowerCase().includes('coro')) {
        return `<span style="color: ${CATEGORY_COLORS[category]}">${line}</span>`;
      }
      return line;
    })
    .join('\n');
};

export const SongView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { songs, prompterSettings } = useSongs();
  const song = songs.find((s) => s.id === id);
  const [isReading, setIsReading] = useState(false);
  const [bpm, setBpm] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const scrollHeightRef = useRef<number>(0);

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

  const startScrolling = () => {
    if (!scrollContainerRef.current) return;

    const scrollHeight =
      scrollContainerRef.current.scrollHeight -
      scrollContainerRef.current.clientHeight;
    scrollHeightRef.current = scrollHeight;
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      if (!startTimeRef.current || !scrollContainerRef.current) return;

      const elapsedTime = currentTime - startTimeRef.current;
      // Ajustement de la durée en fonction du BPM (multiplié par 10 pour une vitesse plus rapide)
      const duration = (scrollHeightRef.current / (bpm / 6)) * 200; // Réduit de 2000 à 200 et bpm de 60 à 6
      const progress = Math.min(elapsedTime / duration, 1);

      scrollContainerRef.current.scrollTop = scrollHeightRef.current * progress;

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsReading(false);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const stopScrolling = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const toggleReading = () => {
    if (isReading) {
      stopScrolling();
      setIsReading(false);
    } else {
      setIsReading(true);
      startScrolling();
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (!song) return null;

  const textColor = prompterSettings.isDarkMode ? 'text-white' : 'text-black';
  const bgColor = prompterSettings.isDarkMode ? 'bg-black' : 'bg-white';

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} safe-area-inset`}>
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-inherit">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center space-x-4">
          {song.lyrics && (
            <>
              <button
                onClick={toggleReading}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                {isReading ? <Pause size={24} /> : <Play size={24} />}
              </button>
              {isReading && (
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="30"
                    max="150"
                    step="10"
                    value={bpm}
                    onChange={(e) => {
                      setBpm(Number(e.target.value));
                      if (isReading) {
                        stopScrolling();
                        startScrolling();
                      }
                    }}
                    className="w-24"
                  />
                  <span className="text-sm">{bpm} BPM</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {!isReading ? (
        <div className="p-4 pb-24">
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
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-inherit border-t">
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