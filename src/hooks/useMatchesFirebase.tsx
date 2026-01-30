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

  // Auto-advance logic for round-robin brackets:
  // Count wins per team from Round 1. Populate Round 2 with teams that have 2 wins (sequential).
  // Populate Final with teams that have 3 wins, or with final Round 2 winner.
  useEffect(() => {
    const processRoundRobinAdvancement = async () => {
      try {
        const byTournament: Record<string, Match[]> = {};
        matches.forEach((m) => {
          if (!m.tournamentId) return;
          if (!byTournament[m.tournamentId]) byTournament[m.tournamentId] = [];
          byTournament[m.tournamentId].push(m);
        });

        for (const tid of Object.keys(byTournament)) {
          const ms = byTournament[tid];
          const round1 = ms.filter((m) => m.round === 1);
          const round2 = ms.filter((m) => m.round === 2).sort((a, b) => {
            const aIdx = parseInt(a.id.split('-').pop() || '0');
            const bIdx = parseInt(b.id.split('-').pop() || '0');
            return aIdx - bIdx;
          });
          const final = ms.find((m) => m.round === 3);

          if (round1.length === 0) continue;

          // Count wins per team from Round 1
          const teamWins: Record<string, number> = {};
          const teamData: Record<string, { team: any; wins: number }> = {};

          round1.forEach((m) => {
            if (m.status === 'completed') {
              const winnerId = m.winnerId ?? (m.scoreA > m.scoreB ? m.teamAId : m.teamBId);
              if (winnerId) {
                teamWins[winnerId] = (teamWins[winnerId] ?? 0) + 1;
                const team = winnerId === m.teamAId ? m.teamA : m.teamB;
                if (team && !teamData[winnerId]) {
                  teamData[winnerId] = { team, wins: 0 };
                }
                teamData[winnerId].wins = teamWins[winnerId];
              }
            }
          });

          // Teams with 3 wins go directly to final
          const threeWinners = Object.entries(teamWins)
            .filter(([_, wins]) => wins === 3)
            .map(([id, _]) => id);

          // Teams with 2 wins go to Round 2 (sequential bracket)
          const twoWinners = Object.entries(teamWins)
            .filter(([_, wins]) => wins === 2)
            .map(([id, _]) => id);

          // Populate Round 2 matches sequentially
          // Example: 3 teams with 2 wins → R2M1: T1 vs T2, R2M2: winner vs T3
          if (twoWinners.length > 0 && round2.length > 0) {
            let r2MatchIdx = 0;
            let nextTeamIdx = 0;

            while (nextTeamIdx < twoWinners.length && r2MatchIdx < round2.length) {
              const r2Match = round2[r2MatchIdx];

              // Populate teamA
              if (!r2Match.teamAId && nextTeamIdx < twoWinners.length) {
                const teamId = twoWinners[nextTeamIdx];
                await updateDoc(doc(db, 'matches', r2Match.id), {
                  teamAId: teamId,
                  teamA: teamData[teamId].team,
                });
                nextTeamIdx++;
              }

              // Populate teamB
              if (!r2Match.teamBId && nextTeamIdx < twoWinners.length) {
                const teamId = twoWinners[nextTeamIdx];
                await updateDoc(doc(db, 'matches', r2Match.id), {
                  teamBId: teamId,
                  teamB: teamData[teamId].team,
                });
                nextTeamIdx++;
              }

              // Check if this R2 match is completed
              if (r2Match.status === 'completed' && r2Match.winnerId) {
                const winner = r2Match.winnerId === r2Match.teamAId ? r2Match.teamA : r2Match.teamB;

                // If there are more teams waiting, advance winner to next R2 match
                if (nextTeamIdx < twoWinners.length && r2MatchIdx + 1 < round2.length) {
                  const nextR2Match = round2[r2MatchIdx + 1];
                  if (!nextR2Match.teamAId) {
                    await updateDoc(doc(db, 'matches', nextR2Match.id), {
                      teamAId: r2Match.winnerId,
                      teamA: winner,
                    });
                  }
                  r2MatchIdx++;
                } else if (nextTeamIdx >= twoWinners.length) {
                  // All 2-win teams have played, this is the final R2 winner
                  // They go to Final as teamB
                  if (final && !final.teamBId) {
                    await updateDoc(doc(db, 'matches', final.id), {
                      teamBId: r2Match.winnerId,
                      teamB: winner,
                    });
                  }
                  break;
                }
              } else {
                r2MatchIdx++;
              }
            }
          }

          // Place 3-win team in Final as teamA
          if (final && !final.teamAId && threeWinners.length > 0) {
            await updateDoc(doc(db, 'matches', final.id), {
              teamAId: threeWinners[0],
              teamA: teamData[threeWinners[0]].team,
            });
          }
        }
      } catch (error) {
        console.error('Error processing round-robin advancement:', error);
      }
    };

    if (matches.length) processRoundRobinAdvancement();
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
