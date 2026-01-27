import { memo } from 'react';
import { Match } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import clsx from 'clsx';

interface MatchCardProps {
  match: Match;
  isAdmin: boolean;
  onUpdateScore: (matchId: string, scoreA: number, scoreB: number) => void;
  onComplete: (matchId: string) => void;
  onStart: (matchId: string) => void;
}

export const MatchCard = memo(({ match, isAdmin, onUpdateScore, onComplete, onStart }: MatchCardProps) => {
  const isWinnerA = match.winnerId && match.teamA && match.winnerId === match.teamA.id;
  const isWinnerB = match.winnerId && match.teamB && match.winnerId === match.teamB.id;

  return (
    <Card className={clsx(
      "p-3 sm:p-4 w-full transition-all relative",
      match.status === 'live' && "border-electricBlue shadow-[0_0_15px_rgba(0,116,255,0.3)] bg-gradient-to-br from-darkBlue to-[#001a3d]",
      match.status === 'completed' && "opacity-80 border-neonGreen/40"
    )}>
      {match.status === 'live' && <div className="absolute top-0 right-0 p-1"><span className="flex h-3 w-3 rounded-full bg-red-500 animate-ping"></span></div>}
      {match.status === 'completed' && match.winnerId && <div className="absolute top-0 right-0 p-1"><span className="text-neonGreen font-bold text-xs">✓</span></div>}

      <div className="flex justify-between items-center mb-3 sm:mb-4 gap-2">
        <span className="text-[10px] sm:text-xs text-white/40 font-mono truncate">M#{match.id.split('-').pop()}</span>
        <Badge status={match.status} />
      </div>

      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Team A */}
        <div className={clsx(
          "flex justify-between items-center p-2 sm:p-3 rounded transition-colors border gap-2",
          isWinnerA ? "bg-neonGreen/10 border-neonGreen shadow-[0_0_10px_rgba(0,255,133,0.2)]" : "bg-black/20 border-white/5"
        )}>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-2xl sm:text-3xl filter drop-shadow-md flex-shrink-0">{match.teamA?.logo || '🛡️'}</span>
            <span className={clsx("font-bold text-sm sm:text-base truncate", isWinnerA ? "text-neonGreen" : "text-white")}>
              {match.teamA?.name || 'TBD'}
            </span>
          </div>
          {isAdmin && match.status === 'live' && match.teamA ? (
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={() => onUpdateScore(match.id, Math.max(0, match.scoreA - 1), match.scoreB)}
                className="w-8 h-8 sm:w-9 sm:h-9 bg-red-600 hover:bg-red-700 text-white font-bold rounded flex items-center justify-center transition-all touch-target"
                aria-label="Decrease Team A score"
              >
                −
              </button>
              <span className={clsx("font-mono font-bold text-lg sm:text-2xl w-10 text-center", match.scoreA > match.scoreB ? "text-white" : "text-white/50")}>{match.scoreA}</span>
              <button
                onClick={() => onUpdateScore(match.id, match.scoreA + 1, match.scoreB)}
                className="w-8 h-8 sm:w-9 sm:h-9 bg-neonGreen hover:bg-green-300 text-darkBlue font-bold rounded flex items-center justify-center transition-all touch-target"
                aria-label="Increase Team A score"
              >
                +
              </button>
            </div>
          ) : (
            <span className={clsx("font-mono font-bold text-xl sm:text-2xl flex-shrink-0", match.scoreA > match.scoreB ? "text-white" : "text-white/50")}>{match.scoreA}</span>
          )}
        </div>

        {/* Team B */}
        <div className={clsx(
          "flex justify-between items-center p-2 sm:p-3 rounded transition-colors border gap-2",
          isWinnerB ? "bg-neonGreen/10 border-neonGreen shadow-[0_0_10px_rgba(0,255,133,0.2)]" : "bg-black/20 border-white/5"
        )}>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-2xl sm:text-3xl filter drop-shadow-md flex-shrink-0">{match.teamB?.logo || '🛡️'}</span>
            <span className={clsx("font-bold text-sm sm:text-base truncate", isWinnerB ? "text-neonGreen" : "text-white")}>
              {match.teamB?.name || 'TBD'}
            </span>
          </div>
          {isAdmin && match.status === 'live' && match.teamB ? (
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={() => onUpdateScore(match.id, match.scoreA, Math.max(0, match.scoreB - 1))}
                className="w-8 h-8 sm:w-9 sm:h-9 bg-red-600 hover:bg-red-700 text-white font-bold rounded flex items-center justify-center transition-all touch-target"
                aria-label="Decrease Team B score"
              >
                −
              </button>
              <span className={clsx("font-mono font-bold text-lg sm:text-2xl w-10 text-center", match.scoreB > match.scoreA ? "text-white" : "text-white/50")}>{match.scoreB}</span>
              <button
                onClick={() => onUpdateScore(match.id, match.scoreA, match.scoreB + 1)}
                className="w-8 h-8 sm:w-9 sm:h-9 bg-neonGreen hover:bg-green-300 text-darkBlue font-bold rounded flex items-center justify-center transition-all touch-target"
                aria-label="Increase Team B score"
              >
                +
              </button>
            </div>
          ) : (
            <span className={clsx("font-mono font-bold text-xl sm:text-2xl flex-shrink-0", match.scoreB > match.scoreA ? "text-white" : "text-white/50")}>{match.scoreB}</span>
          )}
        </div>
      </div>

      {isAdmin && match.status === 'live' && (
        <button
          onClick={() => onComplete(match.id)}
          className="w-full mt-3 sm:mt-4 bg-neonGreen text-darkBlue text-xs sm:text-sm font-black py-2 sm:py-3 uppercase hover:bg-white transition-all shadow-lg clip-path-polygon touch-target"
          style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
        >
          Declare Winner
        </button>
      )}

      {isAdmin && match.status === 'pending' && match.teamA && match.teamB && (
        <button
          onClick={() => onStart(match.id)}
          className="w-full mt-3 sm:mt-4 bg-electricBlue text-white text-xs sm:text-sm font-black py-2 sm:py-3 uppercase hover:bg-white hover:text-darkBlue transition-all shadow-lg clip-path-polygon touch-target"
          style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
        >
          Start Match
        </button>
      )}

    </Card>
  );
});

MatchCard.displayName = 'MatchCard';
