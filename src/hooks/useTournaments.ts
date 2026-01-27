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

export function useTournaments() {
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

  return { tournaments, addTournament, updateTournament, deleteTournament };
}
