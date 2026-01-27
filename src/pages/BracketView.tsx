import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useMatches } from '../hooks/useMatches';
import { useTournaments } from '../hooks/useTournaments';
import { MatchCard } from '../components/match/MatchCard';
import { Match } from '../types';

export const BracketView = () => {
  const { id } = useParams<{ id: string }>();
  const { matches, updateMatch, getMatch } = useMatches(id);
  const { tournaments } = useTournaments();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('isAdmin') === 'true');
  }, []);

  const tournament = tournaments.find(t => t.id === id);

  if (!matches.length) return <div className="p-8 text-center text-white">No matches found. Generate them in details page.</div>;

  // Group matches by round
  const matchesByRound: Record<number, Match[]> = {};
  matches.forEach(m => {
    if (!matchesByRound[m.round]) matchesByRound[m.round] = [];
    matchesByRound[m.round].push(m);
  });
  
  const roundNumbers = Object.keys(matchesByRound).map(Number).sort((a,b) => a-b);
  const maxRound = Math.max(...roundNumbers);

  const getRoundName = (round: number) => {
    if (round === maxRound) {
      return 'Final';
    } else if (round === maxRound - 1 && maxRound > 2) {
      return 'Semi-Final';
    } else if (round === maxRound - 2 && maxRound > 3) {
      return 'Quarter-Final';
    } else if (round === maxRound - 3 && maxRound > 4) {
      return 'Round of 16';
    }
    return `Round ${round}`;
  };

  const handleUpdateScore = (matchId: string, scoreA: number, scoreB: number) => {
    updateMatch(matchId, { scoreA, scoreB });
  };

  const handleStartMatch = (matchId: string) => {
      updateMatch(matchId, { status: 'live' });
  };

  const handleCompleteMatch = (matchId: string) => {
      const match = getMatch(matchId);
      if (!match || !match.teamA || !match.teamB) return;

      if (match.scoreA === match.scoreB) {
          alert('Cannot end match with a tie!');
          return;
      }

      const winnerId = match.scoreA > match.scoreB ? match.teamA.id : match.teamB.id;
      const winnerTeam = match.scoreA > match.scoreB ? match.teamA : match.teamB;

      // Update current match
      updateMatch(matchId, { status: 'completed', winnerId });

      // Advance winner to next match
      if (match.nextMatchId) {
          const nextMatch = getMatch(match.nextMatchId);
          if (nextMatch) {
                // Determine slot A or B based on index
               const currentParts = matchId.split('-');
               const currentIdx = parseInt(currentParts[currentParts.length-1]);
               const isSlotA = currentIdx % 2 === 0;

               if (isSlotA) {
                   updateMatch(nextMatch.id, { teamA: winnerTeam, teamAId: winnerId });
               } else {
                   updateMatch(nextMatch.id, { teamB: winnerTeam, teamBId: winnerId });
               }
               
               // Auto-advance if next match now has both teams
               if (nextMatch.teamA && winnerTeam) {
                   const nextMatchTeamB = isSlotA ? nextMatch.teamB : nextMatch.teamA;
                   if (nextMatchTeamB) {
                       // Next match is ready, it will appear automatically
                   }
               }
          }
      }
  };

  return (
    <div className="h-full container-safe">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div className="flex gap-2 sm:gap-4">
                <Link to={`/tournament/${id}`} className="text-white/50 hover:text-white font-bold text-xs sm:text-sm uppercase">← Details</Link>
                {matches.some(m => m.status === 'completed') && (
                    <Link to={`/tournament/${id}/results`} className="text-neonGreen hover:text-white font-bold text-xs sm:text-sm uppercase">📊 Results</Link>
                )}
            </div>
            <h1 className="text-lg sm:text-2xl font-black italic uppercase text-white text-center sm:text-right">{tournament?.name} Bracket</h1>
         </div>

         <div className="overflow-x-auto pb-12 -mx-4 sm:mx-0">
             <div className="flex gap-8 sm:gap-16 min-w-max px-4 sm:px-0">
                 {roundNumbers.map(round => (
                     <div key={round} className="flex flex-col justify-around gap-6 sm:gap-8 relative w-full sm:w-96">
                         <h3 className="text-center text-electricBlue font-bold uppercase text-xs sm:text-sm mb-2 sm:mb-4 tracking-widest border-b border-white/10 pb-2">
                             {getRoundName(round)}
                         </h3>
                         {matchesByRound[round].map(match => (
                             <div key={match.id} className="relative z-10">
                                 <MatchCard 
                                    match={match} 
                                    isAdmin={isAdmin}
                                    onUpdateScore={handleUpdateScore}
                                    onComplete={handleCompleteMatch}
                                    onStart={handleStartMatch}
                                 />
                             </div>
                         ))}
                     </div>
                 ))}
             </div>
         </div>
    </div>
  );
};
