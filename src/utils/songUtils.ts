import { CATEGORY_COLORS, SongCategory } from '../types';

export const formatLyrics = (lyrics: string, category: SongCategory) => {
  return lyrics
    .split('\n')
    .map((line, _index) => {
      if (line.toLowerCase().includes('coro')) {
        return `<span style="color: ${CATEGORY_COLORS[category]}">${line}</span>`;
      }
      return line;
    })
    .join('\n');
};