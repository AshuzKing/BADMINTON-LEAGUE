import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query } from 'firebase/firestore';
import { Tournament } from '../types';

interface TournamentContextType {
  tournaments: Tournament[];
  addTournament: (tournament: Omit<Tournament, 'id'>) => Promise<void>;
  updateTournament: (id: string, updates: Partial<Tournament>) => Promise<void>;
  deleteTournament: (id: string) => Promise<void>;
  loading: boolean;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export function TournamentProvider({ children }: { children: ReactNode }): JSX.Element {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener for tournaments
  useEffect(() => {
    setLoading(true);
    try {
      const q = query(collection(db, 'tournaments'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const tournamentsData: Tournament[] = [];
        querySnapshot.forEach((doc) => {
          tournamentsData.push({
            id: doc.id,
            ...(doc.data() as Omit<Tournament, 'id'>),
          });
        });
        setTournaments(tournamentsData);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up tournament listener:', error);
      setLoading(false);
    }
  }, []);

  const addTournament = async (tournament: Omit<Tournament, 'id'>) => {
    try {
      await addDoc(collection(db, 'tournaments'), tournament);
    } catch (error) {
      console.error('Error adding tournament:', error);
      throw error;
    }
  };

  const updateTournament = async (id: string, updates: Partial<Tournament>) => {
    try {
      await updateDoc(doc(db, 'tournaments', id), updates);
    } catch (error) {
      console.error('Error updating tournament:', error);
      throw error;
    }
  };

  const deleteTournament = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tournaments', id));
    } catch (error) {
      console.error('Error deleting tournament:', error);
      throw error;
    }
  };

  return (
    <TournamentContext.Provider value={{ tournaments, addTournament, updateTournament, deleteTournament, loading }}>
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
