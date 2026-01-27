import { useLocalStorage } from './useLocalStorage';
import { Team } from '../types';

export function useTeams(tournamentId?: string) {
  const [allTeams, setAllTeams] = useLocalStorage<Team[]>('teams', []);

  const teams = tournamentId 
    ? allTeams.filter((t) => t.tournamentId === tournamentId)
    : allTeams;

  const addTeam = (team: Team) => {
    // Check duplicates within the same tournament
    if (teams.some((t) => t.name.toLowerCase() === team.name.toLowerCase() && t.tournamentId === team.tournamentId)) {
      throw new Error('Team name already exists in this tournament');
    }
    setAllTeams((prev) => [...prev, team]);
  };

  const updateTeam = (id: string, updates: Partial<Team>) => {
    setAllTeams((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTeam = (id: string) => {
    setAllTeams((prev) => prev.filter((t) => t.id !== id));
  }

  return { teams, addTeam, updateTeam, deleteTeam };
}
