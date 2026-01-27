import { useState } from 'react';
import { Team } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';

interface Props {
    tournamentId: string;
    onRegister: (team: Team) => void;
    existingTeams?: Team[];
}

export const TeamRegistrationForm = ({ tournamentId, onRegister, existingTeams = [] }: Props) => {
    const [name, setName] = useState('');
    const [logo, setLogo] = useState('🏸');
    const [color, setColor] = useState('#0074ff'); // Electric Blue default
    const [members, setMembers] = useState<string[]>(['', '']); // Fixed 2 members max
    const [error, setError] = useState('');

    const isColorTaken = (selectedColor: string) => existingTeams.some(t => t.color === selectedColor);
    const isLogoTaken = (selectedLogo: string) => existingTeams.some(t => t.logo === selectedLogo);

    const handleAddMember = () => {
        if (members.length < 2) {
            setMembers([...members, '']);
        }
    };
    const handleMemberChange = (index: number, val: string) => {
        const newMembers = [...members];
        newMembers[index] = val;
        setMembers(newMembers);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const validMembers = members.filter(m => m.trim() !== '');
        
        if (!name || validMembers.length < 2) {
            setError('Team name and 2 members are required');
            return;
        }

        if (isColorTaken(color)) {
            setError('This color is already taken by another team');
            return;
        }

        if (isLogoTaken(logo)) {
            setError('This logo is already taken by another team');
            return;
        }

        onRegister({
            id: crypto.randomUUID(),
            tournamentId,
            name,
            logo,
            color,
            members: validMembers
        });

        // Reset
        setName('');
        setMembers(['', '']);
        setError('');
    };

    return (
        <Card className="mb-6 sm:mb-8 border-electricBlue/30 bg-gradient-to-r from-darkBlue to-[rgba(0,116,255,0.1)]">
            <h3 className="text-lg sm:text-xl font-black italic uppercase mb-4 sm:mb-6 text-electricBlue flex items-center gap-2">
                <span className="text-neonGreen">📝</span> Register New Team
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {error && (
                    <div className="p-3 sm:p-4 bg-red-500/20 border border-red-500 rounded text-red-300 text-xs sm:text-sm">
                        ⚠️ {error}
                    </div>
                )}
                <Input
                    label="Team Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="e.g. Thunder Smashers"
                />

                <div>
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-white/60 mb-3">Team Color</label>
                    <div className="flex gap-2 sm:gap-3 items-center flex-wrap">
                        {['#0074ff', '#ff1493', '#00ff85', '#ffdd00', '#ff6600', '#9933ff', '#00ccff', '#ff3333'].map(c => {
                            const taken = isColorTaken(c);
                            return (
                            <button
                                key={c}
                                type="button"
                                onClick={() => !taken && setColor(c)}
                                disabled={taken}
                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg transition-all border-2 touch-target ${
                                    color === c
                                        ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                                        : taken
                                        ? 'border-red-500/50 opacity-40 cursor-not-allowed'
                                        : 'border-white/20 hover:border-white/50'
                                }`}
                                style={{ backgroundColor: c }}
                                title={taken ? 'This color is taken' : c}
                            >
                                {taken && <span className="text-xs">✓</span>}
                            </button>
                        );
                        })}
                    </div>
                </div>

                <div>
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-white/60 mb-2">Select Team Icon</label>
                    <div className="flex gap-2 sm:gap-4 text-xl sm:text-2xl overflow-x-auto py-3 sm:py-4 px-2 no-scrollbar">
                        {['🏸', '⚡', '🦅', '🐉', '🔥', '🛡️', '⚔️', '👑', '🚀', '🐯', '👿', '🤖'].map(emoji => {
                            const taken = isLogoTaken(emoji);
                            return (
                            <button
                                key={emoji}
                                type="button"
                                onClick={() => !taken && setLogo(emoji)}
                                disabled={taken}
                                className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center transition-all touch-target relative ${
                                    logo === emoji 
                                        ? 'bg-electricBlue text-white ring-2 ring-white scale-110 shadow-[0_0_15px_rgba(0,116,255,0.6)]' 
                                        : taken
                                        ? 'bg-red-500/20 opacity-50 cursor-not-allowed ring-2 ring-red-500'
                                        : 'bg-white/5 opacity-50 hover:opacity-100 hover:bg-white/10'
                                }`}
                            >
                                {emoji}
                                {taken && <span className="absolute -top-1 -right-1 text-xs bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">✓</span>}
                            </button>
                        );
                        })}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center gap-2">
                        <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-white/60">Squad Members (Max 2)</label>
                        {members.length < 2 && (
                            <button type="button" onClick={handleAddMember} className="text-xs sm:text-sm text-electricBlue font-bold hover:text-white transition-colors whitespace-nowrap">+ ADD</button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {members.map((m, i) => (
                            <Input
                                key={i}
                                placeholder={`Player ${i + 1}`}
                                value={m}
                                onChange={e => handleMemberChange(i, e.target.value)}
                                required={i < 2}
                            />
                        ))}
                    </div>
                </div>

                <Button type="submit" fullWidth disabled={!name || members.filter(m => m.trim()).length < 2} variant="success" className="text-xs sm:text-sm">
                    Confirm Registration
                </Button>
            </form>
        </Card>
    );
};
