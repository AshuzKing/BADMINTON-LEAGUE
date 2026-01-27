import { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Team } from '../types';

interface TeamContextType {
  teams: Team[];
  addTeam: (team: Team) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  getTeamsByTournament: (tournamentId: string) => Team[];
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }): JSX.Element {
  const [teams, setTeams] = useLocalStorage<Team[]>('teams', []);

  const addTeam = (team: Team) => {
    if (teams.some((t) => t.name.toLowerCase() === team.name.toLowerCase() && t.tournamentId === team.tournamentId)) {
      throw new Error('Team name already exists in this tournament');
    }
    setTeams((prev) => [...prev, team]);
  };

  const updateTeam = (id: string, updates: Partial<Team>) => {
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTeam = (id: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== id));
  };

  const getTeamsByTournament = (tournamentId: string) => {
    return teams.filter((t) => t.tournamentId === tournamentId);
  };

  return (
    <TeamContext.Provider value={{ teams, addTeam, updateTeam, deleteTeam, getTeamsByTournament }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeams(tournamentId?: string) {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeams must be used within a TeamProvider');
  }

  if (tournamentId) {
    return {
      teams: context.getTeamsByTournament(tournamentId),
      addTeam: context.addTeam,
      updateTeam: context.updateTeam,
      deleteTeam: context.deleteTeam,
    };
  }

  return {
    teams: context.teams,
    addTeam: context.addTeam,
    updateTeam: context.updateTeam,
    deleteTeam: context.deleteTeam,
  };
}
