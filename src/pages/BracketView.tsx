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
          }
      }
  };

  return (
    <div className="h-full">
         <div className="flex justify-between items-center mb-6">
            <Link to={`/tournament/${id}`} className="text-white/50 hover:text-white font-bold text-sm uppercase">← Tournament Details</Link>
            <h1 className="text-2xl font-black italic uppercase text-white">{tournament?.name} Bracket</h1>
         </div>

         <div className="overflow-x-auto pb-12">
             <div className="flex gap-16 min-w-max px-4">
                 {roundNumbers.map(round => (
                     <div key={round} className="flex flex-col justify-around gap-8 relative min-w-[300px]">
                         <h3 className="text-center text-electricBlue font-bold uppercase text-sm mb-4 tracking-widest border-b border-white/10 pb-2">
                             {round === roundNumbers.length ? 'Finals' : 
                              round === roundNumbers.length - 1 && roundNumbers.length > 2 ? 'Semi Finals' : `Round ${round}`}
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
                                 
                                 {/* Connector Lines Logic Concept:
                                     Div positioned absolute to right: -2rem
                                     Height: calculated based on next match position?
                                     Too complex for raw CSS layout in grid. 
                                     Relying on gap-16 spacing.
                                 */}
                             </div>
                         ))}
                     </div>
                 ))}
             </div>
         </div>
    </div>
  );
};
