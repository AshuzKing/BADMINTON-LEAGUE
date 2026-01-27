import { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Tournament } from '../types';

const DEFAULT_TOURNAMENTS: Tournament[] = [
  {
    id: '1',
    name: 'Shuttle Smash Championship 2026',
    date: '2026-02-01',
    status: 'registration',
    settings: {
      maxTeamMembers: 4,
      format: 'knockout',
    },
  },
];

interface TournamentContextType {
  tournaments: Tournament[];
  addTournament: (tournament: Tournament) => void;
  updateTournament: (id: string, updates: Partial<Tournament>) => void;
  deleteTournament: (id: string) => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export function TournamentProvider({ children }: { children: ReactNode }): JSX.Element {
  const [tournaments, setTournaments] = useLocalStorage<Tournament[]>('tournaments', DEFAULT_TOURNAMENTS);

  const addTournament = (tournament: Tournament) => {
    setTournaments((prev) => [...prev, tournament]);
  };

  const updateTournament = (id: string, updates: Partial<Tournament>) => {
    setTournaments((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTournament = (id: string) => {
    setTournaments((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TournamentContext.Provider value={{ tournaments, addTournament, updateTournament, deleteTournament }}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournaments() {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error('useTournaments must be used within a TournamentProvider');
  }
  return context;
}
