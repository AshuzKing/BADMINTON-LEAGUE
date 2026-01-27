import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { Team } from '../types';

interface TeamContextType {
  teams: Team[];
  addTeam: (team: Omit<Team, 'id'>) => Promise<void>;
  updateTeam: (id: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  getTeamsByTournament: (tournamentId: string) => Team[];
  loading: boolean;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }): JSX.Element {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener for teams
  useEffect(() => {
    setLoading(true);
    try {
      const q = query(collection(db, 'teams'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const teamsData: Team[] = [];
        querySnapshot.forEach((doc) => {
          teamsData.push({
            id: doc.id,
            ...(doc.data() as Omit<Team, 'id'>),
          });
        });
        setTeams(teamsData);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up team listener:', error);
      setLoading(false);
    }
  }, []);

  const addTeam = async (team: Team | Omit<Team, 'id'>) => {
    try {
      // Strip ID if provided (handle both Team and Omit<Team, 'id'>)
      const teamData = { ...(team as any) };
      delete teamData.id;

      // Check for duplicate team name in the same tournament
      const existingTeam = teams.find(
        t => t.name.toLowerCase() === teamData.name.toLowerCase() && t.tournamentId === teamData.tournamentId
      );
      if (existingTeam) {
        throw new Error('Team name already exists in this tournament');
      }

      // Check for duplicate color and logo in the same tournament
      const colorDuplicate = teams.find(
        t => t.color === teamData.color && t.tournamentId === teamData.tournamentId
      );
      if (colorDuplicate) {
        throw new Error('This color is already taken by another team');
      }

      const logoDuplicate = teams.find(
        t => t.logo === teamData.logo && t.tournamentId === teamData.tournamentId
      );
      if (logoDuplicate) {
        throw new Error('This logo is already taken by another team');
      }

      await addDoc(collection(db, 'teams'), teamData);
    } catch (error) {
      console.error('Error adding team:', error);
      throw error;
    }
  };

  const updateTeam = async (id: string, updates: Partial<Team>) => {
    try {
      await updateDoc(doc(db, 'teams', id), updates);
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  };

  const deleteTeam = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'teams', id));
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  };

  const getTeamsByTournament = (tournamentId: string) => {
    return teams.filter((t) => t.tournamentId === tournamentId);
  };

  return (
    <TeamContext.Provider value={{ teams, addTeam, updateTeam, deleteTeam, getTeamsByTournament, loading }}>
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
      loading: context.loading,
    };
  }

  return {
    teams: context.teams,
    addTeam: context.addTeam,
    updateTeam: context.updateTeam,
    deleteTeam: context.deleteTeam,
    loading: context.loading,
  };
}
