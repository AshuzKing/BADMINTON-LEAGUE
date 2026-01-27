import { memo } from 'react';
import { Team } from '../../types';
import { Card } from '../common/Card';

interface TeamCardProps {
    team: Team;
    isAdmin?: boolean;
    onDelete?: (id: string) => void;
}

export const TeamCard = memo(({ team, isAdmin, onDelete }: TeamCardProps) => {
    return (
        <Card className="p-3 sm:p-4 border-l-4 h-full relative" style={{ borderLeftColor: team.color || '#0074ff' }}>
            {isAdmin && onDelete && (
                <button
                    onClick={() => {
                        if (confirm('Are you sure you want to delete this team?')) {
                            onDelete(team.id);
                        }
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 sm:p-2.5 rounded font-bold text-lg sm:text-xl shadow-lg hover:shadow-red-500/50 touch-target transition-all hover:scale-110"
                    title="Delete Team"
                    aria-label="Delete team"
                >
                    ✕
                </button>
            )}
            <div className="flex items-center gap-3 sm:gap-4">
                <div 
                    className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-full flex items-center justify-center text-2xl sm:text-3xl border-2 flex-shrink-0"
                    style={{ borderColor: team.color || '#0074ff' }}
                    role="img"
                    aria-label={team.name}
                >
                    {team.logo || '🏸'}
                </div>
                <div className="min-w-0">
                    <h4 className="font-bold text-base sm:text-lg leading-tight text-white truncate">{team.name}</h4>
                    <p className="text-xs sm:text-sm text-white/50">{team.members.length} Members</p>
                </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
                {team.members.map((m, i) => (
                    <span key={i} className="text-xs bg-white/5 px-2 py-1 rounded text-white/70 border border-white/5 truncate">{m}</span>
                ))}
            </div>
        </Card>
    );
});

TeamCard.displayName = 'TeamCard';
