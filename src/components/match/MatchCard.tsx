import { Match } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import clsx from 'clsx';
import { useState } from 'react';

interface MatchCardProps {
  match: Match;
  isAdmin: boolean;
  onUpdateScore: (matchId: string, scoreA: number, scoreB: number) => void;
  onComplete: (matchId: string) => void;
  onStart: (matchId: string) => void;
}

export const MatchCard = ({ match, isAdmin, onUpdateScore, onComplete, onStart }: MatchCardProps) => {
  const isWinnerA = match.winnerId && match.teamA && match.winnerId === match.teamA.id;
  const isWinnerB = match.winnerId && match.teamB && match.winnerId === match.teamB.id;

  return (
    <Card className={clsx(
        "p-3 min-w-[280px] transition-all relative", 
        match.status === 'live' && "border-electricBlue shadow-[0_0_15px_rgba(0,116,255,0.3)] bg-gradient-to-br from-darkBlue to-[#001a3d]",
        match.status === 'completed' && "opacity-80"
    )}>
      {match.status === 'live' && <div className="absolute top-0 right-0 p-1"><span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span></div>}
      
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] text-white/40 font-mono">MATCH #{match.id.split('-').pop()}</span>
        <Badge status={match.status} />
      </div>

      <div className="flex flex-col gap-3">
        {/* Team A */}
        <div className={clsx(
            "flex justify-between items-center p-2 rounded transition-colors border", 
            isWinnerA ? "bg-neonGreen/10 border-neonGreen shadow-[0_0_10px_rgba(0,255,133,0.2)]" : "bg-black/20 border-white/5"
        )}>
            <div className="flex items-center gap-3">
                <span className="text-xl filter drop-shadow-md">{match.teamA?.logo || '🛡️'}</span>
                <span className={clsx("font-bold text-sm", isWinnerA ? "text-neonGreen" : "text-white")}>
                    {match.teamA?.name || 'TBD'}
                </span>
            </div>
            {isAdmin && match.status === 'live' && match.teamA ? (
                 <input 
                    type="number" 
                    className="w-14 bg-black/40 border border-white/20 text-center text-white py-1 rounded font-mono text-lg focus:border-electricBlue focus:outline-none"
                    value={match.scoreA}
                    min="0"
                    onChange={(e) => onUpdateScore(match.id, parseInt(e.target.value) || 0, match.scoreB)}
                 />
            ) : (
                <span className={clsx("font-mono font-bold text-xl", match.scoreA > match.scoreB ? "text-white" : "text-white/50")}>{match.scoreA}</span>
            )}
        </div>

        {/* Team B */}
        <div className={clsx(
            "flex justify-between items-center p-2 rounded transition-colors border", 
            isWinnerB ? "bg-neonGreen/10 border-neonGreen shadow-[0_0_10px_rgba(0,255,133,0.2)]" : "bg-black/20 border-white/5"
        )}>
            <div className="flex items-center gap-3">
                <span className="text-xl filter drop-shadow-md">{match.teamB?.logo || '🛡️'}</span>
                <span className={clsx("font-bold text-sm", isWinnerB ? "text-neonGreen" : "text-white")}>
                    {match.teamB?.name || 'TBD'}
                </span>
            </div>
            {isAdmin && match.status === 'live' && match.teamB ? (
                 <input 
                     type="number" 
                    className="w-14 bg-black/40 border border-white/20 text-center text-white py-1 rounded font-mono text-lg focus:border-electricBlue focus:outline-none"
                    value={match.scoreB}
                    min="0"
                    onChange={(e) => onUpdateScore(match.id, match.scoreA, parseInt(e.target.value) || 0)}
                 />
            ) : (
                <span className={clsx("font-mono font-bold text-xl", match.scoreB > match.scoreA ? "text-white" : "text-white/50")}>{match.scoreB}</span>
            )}
        </div>
      </div>

      {isAdmin && match.status === 'live' && (
          <button 
            onClick={() => onComplete(match.id)}
            className="w-full mt-4 bg-neonGreen text-darkBlue text-xs font-black py-2 uppercase hover:bg-white transition-all shadow-lg clip-path-polygon"
            style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
          >
              Declare Winner & Advance
          </button>
      )}
       
      {isAdmin && match.status === 'pending' && match.teamA && match.teamB && (
          <button 
            onClick={() => onStart(match.id)}
            className="w-full mt-4 bg-electricBlue text-white text-xs font-black py-2 uppercase hover:bg-white hover:text-darkBlue transition-all shadow-lg"
            style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
          >
              Start Match
          </button>
      )}

    </Card>
  );
};
