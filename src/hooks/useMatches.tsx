import { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Match } from '../types';

interface MatchContextType {
  matches: Match[];
  saveMatches: (newMatches: Match[], tournamentId?: string) => void;
  updateMatch: (matchId: string, updates: Partial<Match>) => void;
  getMatch: (matchId: string) => Match | undefined;
  getMatchesByTournament: (tournamentId: string) => Match[];
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export function MatchProvider({ children }: { children: ReactNode }): JSX.Element {
  const [matches, setMatches] = useLocalStorage<Match[]>('matches', []);

  const saveMatches = (newMatches: Match[], tournamentId?: string) => {
    setMatches((prev) => {
      if (!tournamentId) return [...prev, ...newMatches];
      const otherMatches = prev.filter(m => m.tournamentId !== tournamentId);
      return [...otherMatches, ...newMatches];
    });
  };

  const updateMatch = (matchId: string, updates: Partial<Match>) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, ...updates } : m));
  };

  const getMatch = (matchId: string) => matches.find(m => m.id === matchId);

  const getMatchesByTournament = (tournamentId: string) => {
    return matches.filter((m) => m.tournamentId === tournamentId);
  };

  return (
    <MatchContext.Provider value={{ matches, saveMatches, updateMatch, getMatch, getMatchesByTournament }}>
      {children}
    </MatchContext.Provider>
  );
}

export function useMatches(tournamentId?: string) {
  const context = useContext(MatchContext);
  if (context === undefined) {
    throw new Error('useMatches must be used within a MatchProvider');
  }

  if (tournamentId) {
    return {
      matches: context.getMatchesByTournament(tournamentId),
      saveMatches: (newMatches: Match[]) => context.saveMatches(newMatches, tournamentId),
      updateMatch: context.updateMatch,
      getMatch: context.getMatch,
    };
  }

  return {
    matches: context.matches,
    saveMatches: (newMatches: Match[]) => context.saveMatches(newMatches),
    updateMatch: context.updateMatch,
    getMatch: context.getMatch,
  };
}
