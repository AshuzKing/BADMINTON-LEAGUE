import { memo, useState } from 'react';
import { Team } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface TeamCardProps {
    team: Team;
    isAdmin?: boolean;
    onDelete?: (id: string) => void;
    onUpdate?: (id: string, updates: Partial<Team>) => Promise<void>;
}

const TEAM_COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'];
const TEAM_LOGOS = ['🏸', '🎯', '⚡', '🔥', '⭐', '🏆', '💪', '🎪', '🚀', '🎨', '🌟', '💎'];

export const TeamCard = memo(({ team, isAdmin, onDelete, onUpdate }: TeamCardProps) => {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        name: team.name,
        color: team.color,
        logo: team.logo,
    });

    const handleSaveEdit = async () => {
        if (!editForm.name.trim()) {
            alert('Team name cannot be empty');
            return;
        }
        try {
            await onUpdate?.(team.id, {
                name: editForm.name,
                color: editForm.color,
                logo: editForm.logo,
            });
            setIsEditOpen(false);
        } catch (err) {
            console.error('Failed to update team:', err);
            alert('Failed to update team');
        }
    };

    return (
        <>
            <Card className="p-3 sm:p-4 border-l-4 h-full relative" style={{ borderLeftColor: team.color || '#0074ff' }}>
                <div className="flex gap-2 absolute top-2 right-2">
                    <button
                        onClick={() => setIsEditOpen(true)}
                        className="bg-electricBlue hover:bg-blue-600 text-white p-2 sm:p-2.5 rounded font-bold text-lg sm:text-xl shadow-lg hover:shadow-blue-500/50 touch-target transition-all hover:scale-110"
                        title="Edit Team"
                        aria-label="Edit team"
                    >
                        ✎
                    </button>
                    {isAdmin && onDelete && (
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this team?')) {
                                    onDelete(team.id);
                                }
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 sm:p-2.5 rounded font-bold text-lg sm:text-xl shadow-lg hover:shadow-red-500/50 touch-target transition-all hover:scale-110"
                            title="Delete Team"
                            aria-label="Delete team"
                        >
                            ✕
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-3 sm:gap-4 pr-24">
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

            {/* Edit Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm safe-area-inset">
                    <Card className="w-full max-w-md bg-darkBlue border-electricBlue shadow-[0_0_50px_rgba(0,116,255,0.3)]">
                        <h2 className="text-xl sm:text-2xl font-bold italic uppercase mb-4 text-white">Edit Team</h2>
                        
                        <div className="space-y-4">
                            <Input
                                label="Team Name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                placeholder="Enter team name"
                            />

                            <div>
                                <label className="text-xs font-bold uppercase text-white/70 block mb-2">Team Color</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {TEAM_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setEditForm({ ...editForm, color })}
                                            className={`w-full h-10 rounded border-2 transition-all touch-target ${
                                                editForm.color === color
                                                    ? 'border-white ring-2 ring-white'
                                                    : 'border-white/20 hover:border-white/50'
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-white/70 block mb-2">Team Logo</label>
                                <div className="grid grid-cols-6 gap-2">
                                    {TEAM_LOGOS.map((logo) => (
                                        <button
                                            key={logo}
                                            onClick={() => setEditForm({ ...editForm, logo })}
                                            className={`w-full h-10 rounded border-2 text-xl flex items-center justify-center transition-all touch-target ${
                                                editForm.logo === logo
                                                    ? 'border-neonGreen ring-2 ring-neonGreen'
                                                    : 'border-white/20 hover:border-white/50'
                                            }`}
                                        >
                                            {logo}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end mt-6">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setIsEditOpen(false);
                                    setEditForm({ name: team.name, color: team.color, logo: team.logo });
                                }}
                                className="text-xs sm:text-sm w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleSaveEdit}
                                className="text-xs sm:text-sm w-full sm:w-auto"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
});

TeamCard.displayName = 'TeamCard';
