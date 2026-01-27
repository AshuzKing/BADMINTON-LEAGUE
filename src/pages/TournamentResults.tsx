import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useMatches } from '../hooks/useMatches';
import { useTournaments } from '../hooks/useTournaments';
import { useTeams } from '../hooks/useTeams';
import { Match, Team } from '../types';

interface TeamResult {
  team: Team;
  wins: number;
  losses: number;
  roundReachedName: string;
  roundNumber: number;
}

export const TournamentResults = () => {
  const { id } = useParams<{ id: string }>();
  const { matches } = useMatches(id);
  const { tournaments } = useTournaments();
  const { teams } = useTeams(id);
  const [results, setResults] = useState<TeamResult[]>([]);

  const tournament = tournaments.find(t => t.id === id);

  useEffect(() => {
    // Calculate results for each team
    const teamResults: Record<string, TeamResult> = {};

    // Initialize all teams
    teams.forEach(team => {
      teamResults[team.id] = {
        team,
        wins: 0,
        losses: 0,
        roundReachedName: 'Round 1',
        roundNumber: 1,
      };
    });

    // Count wins and losses from completed matches
    matches.forEach(match => {
      if (match.status === 'completed' && match.winnerId) {
        // Award win to winner
        if (match.teamA && match.teamA.id === match.winnerId) {
          if (teamResults[match.teamA.id]) {
            teamResults[match.teamA.id].wins += 1;
            teamResults[match.teamA.id].roundNumber = Math.max(teamResults[match.teamA.id].roundNumber, match.round + 1);
          }
        }
        // Award loss to loser
        if (match.teamB && match.teamB.id !== match.winnerId) {
          if (teamResults[match.teamB.id]) {
            teamResults[match.teamB.id].losses += 1;
            teamResults[match.teamB.id].roundNumber = Math.max(teamResults[match.teamB.id].roundNumber, match.round);
          }
        }
        if (match.teamA && match.teamA.id !== match.winnerId) {
          if (teamResults[match.teamA.id]) {
            teamResults[match.teamA.id].losses += 1;
            teamResults[match.teamA.id].roundNumber = Math.max(teamResults[match.teamA.id].roundNumber, match.round);
          }
        }
      }
    });

    // Determine max round to calculate round names
    const maxRound = Math.max(...matches.map(m => m.round), 1);

    // Update round names based on tournament structure
    Object.values(teamResults).forEach(result => {
      if (result.roundNumber > maxRound) {
        result.roundReachedName = 'Champion 🏆';
      } else if (result.roundNumber === maxRound) {
        result.roundReachedName = maxRound === 1 ? 'Final' : `Final (Round ${maxRound})`;
      } else if (result.roundNumber === maxRound - 1 && maxRound > 2) {
        result.roundReachedName = `Semi-Final (Round ${result.roundNumber})`;
      } else if (result.roundNumber > 1) {
        result.roundReachedName = `Round ${result.roundNumber}`;
      } else {
        result.roundReachedName = 'Round 1';
      }
    });

    // Sort by wins (descending), then by losses (ascending)
    const sortedResults = Object.values(teamResults).sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.losses - b.losses;
    });

    setResults(sortedResults);
  }, [matches, teams]);

  if (!tournament) return <div>Tournament not found</div>;

  const completedMatches = matches.filter(m => m.status === 'completed');
  const maxRound = Math.max(...matches.map(m => m.round), 1);

  return (
    <div className="container-safe">
      <Link to={`/tournament/${id}`} className="text-white/50 hover:text-white mb-4 block text-xs sm:text-sm font-bold uppercase tracking-wider">← Back to Tournament</Link>

      <header className="mb-8">
        <h1 className="mb-2">{tournament.name}</h1>
        <p className="text-white/60 text-sm sm:text-base">Tournament Results & Standings</p>
      </header>

      {completedMatches.length === 0 ? (
        <div className="p-6 sm:p-8 border border-dashed border-white/20 rounded text-center text-white/40 bg-white/5">
          <p className="text-sm sm:text-base">No matches completed yet. Start the tournament to see results!</p>
        </div>
      ) : (
        <>
          {/* Standings Table */}
          <div className="mb-8 sm:mb-12">
            <h2 className="text-lg sm:text-2xl font-bold italic uppercase mb-4 sm:mb-6 text-white border-b border-white/10 pb-2">
              🏅 Standings
            </h2>
            <div className="overflow-x-auto rounded-lg border border-white/10 bg-black/30">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-black/50">
                    <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-bold uppercase text-electricBlue tracking-wider">Position</th>
                    <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-bold uppercase text-electricBlue tracking-wider">Team</th>
                    <th className="p-3 sm:p-4 text-center text-xs sm:text-sm font-bold uppercase text-neonGreen tracking-wider">Wins</th>
                    <th className="p-3 sm:p-4 text-center text-xs sm:text-sm font-bold uppercase text-red-400 tracking-wider">Losses</th>
                    <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-bold uppercase text-white/60 tracking-wider">Reached</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, idx) => (
                    <tr key={result.team.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-3 sm:p-4">
                        <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-electricBlue to-darkBlue font-bold text-xs sm:text-sm">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-lg sm:text-2xl">{result.team.logo}</span>
                          <div>
                            <p className="font-bold text-sm sm:text-base text-white">{result.team.name}</p>
                            <p className="text-xs text-white/40">{result.team.members.length} Members</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        <span className="inline-block px-2 sm:px-3 py-1 bg-neonGreen/20 text-neonGreen font-bold rounded text-xs sm:text-sm">
                          {result.wins}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        <span className="inline-block px-2 sm:px-3 py-1 bg-red-500/20 text-red-300 font-bold rounded text-xs sm:text-sm">
                          {result.losses}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <span className={`text-xs sm:text-sm font-bold ${
                          result.roundReachedName.includes('Champion') 
                            ? 'text-yellow-400' 
                            : result.roundReachedName.includes('Final') 
                            ? 'text-electricBlue'
                            : 'text-white/70'
                        }`}>
                          {result.roundReachedName}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Match Results by Round */}
          <div>
            <h2 className="text-lg sm:text-2xl font-bold italic uppercase mb-4 sm:mb-6 text-white border-b border-white/10 pb-2">
              📊 Match Results
            </h2>
            <div className="space-y-6 sm:space-y-8">
              {Array.from({ length: maxRound }, (_, i) => i + 1).map(round => {
                const roundMatches = matches.filter(m => m.round === round && m.status === 'completed');
                if (roundMatches.length === 0) return null;

                let roundName = `Round ${round}`;
                if (round === maxRound) {
                  roundName = maxRound === 1 ? 'Final' : 'Final Round';
                } else if (round === maxRound - 1 && maxRound > 2) {
                  roundName = 'Semi-Final Round';
                } else if (round === maxRound - 2 && maxRound > 3) {
                  roundName = 'Quarter-Final Round';
                }

                return (
                  <div key={round}>
                    <h3 className="text-base sm:text-lg font-bold uppercase text-electricBlue mb-3 sm:mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-electricBlue/20 flex items-center justify-center text-xs sm:text-sm font-bold">{round}</span>
                      {roundName}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {roundMatches.map(match => (
                        <div key={match.id} className="p-3 sm:p-4 bg-black/40 border border-white/10 rounded-lg">
                          <div className="space-y-2">
                            {/* Team A */}
                            <div className={`flex justify-between items-center p-2 rounded text-xs sm:text-sm ${
                              match.winnerId === match.teamA?.id
                                ? 'bg-neonGreen/20 text-neonGreen font-bold'
                                : 'bg-white/5 text-white/70'
                            }`}>
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-base sm:text-lg">{match.teamA?.logo}</span>
                                <span className="truncate">{match.teamA?.name}</span>
                              </div>
                              <span className="font-bold ml-2">{match.scoreA}</span>
                            </div>
                            {/* Team B */}
                            <div className={`flex justify-between items-center p-2 rounded text-xs sm:text-sm ${
                              match.winnerId === match.teamB?.id
                                ? 'bg-neonGreen/20 text-neonGreen font-bold'
                                : 'bg-white/5 text-white/70'
                            }`}>
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-base sm:text-lg">{match.teamB?.logo}</span>
                                <span className="truncate">{match.teamB?.name}</span>
                              </div>
                              <span className="font-bold ml-2">{match.scoreB}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
