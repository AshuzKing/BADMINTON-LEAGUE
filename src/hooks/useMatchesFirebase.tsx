import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where, writeBatch } from 'firebase/firestore';
import { Match } from '../types';

interface MatchContextType {
  matches: Match[];
  saveMatches: (newMatches: Match[], tournamentId?: string) => Promise<void>;
  deleteMatchesByTournament: (tournamentId: string) => Promise<void>;
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

  const deleteMatchesByTournament = async (tournamentId: string) => {
    try {
      const batch = writeBatch(db);
      const oldMatches = matches.filter(m => m.tournamentId === tournamentId);
      oldMatches.forEach(match => {
        batch.delete(doc(db, 'matches', match.id));
      });
      await batch.commit();
    } catch (error) {
      console.error('Error deleting matches for tournament:', error);
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

  // Auto-advance logic for special 6-team brackets:
  // When all three Round 1 matches are completed, pick the winner with the largest
  // margin and advance them directly to the final. Place the other two winners
  // into the semifinal so they can play for the second final slot.
  useEffect(() => {
    const processSixTeamBrackets = async () => {
      try {
        // Group matches by tournament
        const byTournament: Record<string, Match[]> = {};
        matches.forEach((m) => {
          if (!m.tournamentId) return;
          if (!byTournament[m.tournamentId]) byTournament[m.tournamentId] = [];
          byTournament[m.tournamentId].push(m);
        });

        for (const tid of Object.keys(byTournament)) {
          const ms = byTournament[tid];
          const round1 = ms.filter((m) => m.round === 1);
          if (round1.length !== 3) continue; // only care about 6-team pattern

          // proceed only when all round1 matches are completed
          if (!round1.every((m) => m.status === 'completed')) continue;

          const semifinal = ms.find((m) => m.round === 2);
          const final = ms.find((m) => m.round === 3);
          if (!semifinal || !final) continue;

          // avoid re-running if final already has a direct qualifier
          if (final.teamAId) continue;

          // compute winners and margins
          const winners = round1.map((m) => {
            const sA = m.scoreA ?? 0;
            const sB = m.scoreB ?? 0;
            const winnerId = m.winnerId ?? (sA > sB ? m.teamAId : m.teamBId);
            const winnerTeam = winnerId === m.teamAId ? m.teamA : m.teamB;
            const margin = Math.abs(sA - sB);
            return { matchId: m.id, winnerId, winnerTeam, margin };
          });

          // sort by margin descending
          winners.sort((a, b) => b.margin - a.margin);
          const top = winners[0];
          const otherTwo = [winners[1], winners[2]];

          // update semifinal with the other two winners
          await updateDoc(doc(db, 'matches', semifinal.id), {
            teamAId: otherTwo[0].winnerId,
            teamBId: otherTwo[1].winnerId,
            teamA: otherTwo[0].winnerTeam ?? null,
            teamB: otherTwo[1].winnerTeam ?? null,
          });

          // update final's teamA as the top margin winner
          await updateDoc(doc(db, 'matches', final.id), {
            teamAId: top.winnerId,
            teamA: top.winnerTeam ?? null,
          });
        }
      } catch (error) {
        console.error('Error processing 6-team bracket advancement:', error);
      }
    };

    if (matches.length) processSixTeamBrackets();
  }, [matches]);

  return (
    <MatchContext.Provider value={{ matches, saveMatches, deleteMatchesByTournament, updateMatch, getMatch, getMatchesByTournament, loading }}>
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
      deleteMatches: () => context.deleteMatchesByTournament(tournamentId),
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
