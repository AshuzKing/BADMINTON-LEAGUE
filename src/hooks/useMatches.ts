import { useLocalStorage } from './useLocalStorage';
import { Match } from '../types';

export function useMatches(tournamentId?: string) {
  const [allMatches, setAllMatches] = useLocalStorage<Match[]>('matches', []);
  
  const matches = tournamentId 
    ? allMatches.filter((m) => m.tournamentId === tournamentId)
    : allMatches;

  const saveMatches = (newMatches: Match[]) => {
    setAllMatches((prev) => {
        if (!tournamentId) return [...prev, ...newMatches];
        // Remove old matches for this tournament if tournamentId is provided context
        const otherMatches = prev.filter(m => m.tournamentId !== tournamentId);
        return [...otherMatches, ...newMatches];
    })
  };
  
  const updateMatch = (matchId: string, updates: Partial<Match>) => {
      setAllMatches(prev => prev.map(m => m.id === matchId ? {...m, ...updates} : m));
  };

  const getMatch = (matchId: string) => allMatches.find(m => m.id === matchId);

  return { matches, saveMatches, updateMatch, getMatch };
}
