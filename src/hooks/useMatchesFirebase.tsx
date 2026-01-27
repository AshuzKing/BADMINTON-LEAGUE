import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where, writeBatch } from 'firebase/firestore';
import { Match } from '../types';

interface MatchContextType {
  matches: Match[];
  saveMatches: (newMatches: Match[], tournamentId?: string) => Promise<void>;
  updateMatch: (matchId: string, updates: Partial<Match>) => Promise<void>;
  getMatch: (matchId: string) => Match | undefined;
  getMatchesByTournament: (tournamentId: string) => Match[];
  loading: boolean;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export function MatchProvider({ children }: { children: ReactNode }): JSX.Element {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener for matches
  useEffect(() => {
    setLoading(true);
    try {
      const q = query(collection(db, 'matches'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const matchesData: Match[] = [];
        querySnapshot.forEach((doc) => {
          matchesData.push({
            id: doc.id,
            ...(doc.data() as Omit<Match, 'id'>),
          });
        });
        setMatches(matchesData);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up match listener:', error);
      setLoading(false);
    }
  }, []);

  const saveMatches = async (newMatches: Match[], tournamentId?: string) => {
    try {
      const batch = writeBatch(db);

      // If tournamentId provided, delete old matches for this tournament
      if (tournamentId) {
        const oldMatches = matches.filter(m => m.tournamentId === tournamentId);
        oldMatches.forEach(match => {
          batch.delete(doc(db, 'matches', match.id));
        });
      }

      // Add new matches
      newMatches.forEach((match) => {
        const matchRef = doc(db, 'matches', match.id);
        batch.set(matchRef, match);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error saving matches:', error);
      throw error;
    }
  };

  const updateMatch = async (matchId: string, updates: Partial<Match>) => {
    try {
      await updateDoc(doc(db, 'matches', matchId), updates);
    } catch (error) {
      console.error('Error updating match:', error);
      throw error;
    }
  };

  const getMatch = (matchId: string) => {
    return matches.find(m => m.id === matchId);
  };

  const getMatchesByTournament = (tournamentId: string) => {
    return matches.filter((m) => m.tournamentId === tournamentId);
  };

  return (
    <MatchContext.Provider value={{ matches, saveMatches, updateMatch, getMatch, getMatchesByTournament, loading }}>
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
      loading: context.loading,
    };
  }

  return {
    matches: context.matches,
    saveMatches: (newMatches: Match[]) => context.saveMatches(newMatches),
    updateMatch: context.updateMatch,
    getMatch: context.getMatch,
    loading: context.loading,
  };
}
