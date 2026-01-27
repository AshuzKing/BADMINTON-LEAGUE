import { useState } from 'react';
import { Team } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';

interface Props {
  tournamentId: string;
  onRegister: (team: Team) => void;
}

export const TeamRegistrationForm = ({ tournamentId, onRegister }: Props) => {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('🏸');
  const [members, setMembers] = useState<string[]>(['', '']); // Min 2

  const handleAddMember = () => setMembers([...members, '']);
  const handleMemberChange = (index: number, val: string) => {
    const newMembers = [...members];
    newMembers[index] = val;
    setMembers(newMembers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validMembers = members.filter(m => m.trim() !== '');
    if (!name || validMembers.length < 2) return;

    onRegister({
      id: crypto.randomUUID(),
      tournamentId,
      name,
      logo,
      members: validMembers
    });
    
    // Reset
    setName('');
    setMembers(['', '']);
  };

  return (
    <Card className="mb-8 border-electricBlue/30 bg-gradient-to-r from-darkBlue to-[rgba(0,116,255,0.1)]">
        <h3 className="text-xl font-black italic uppercase mb-6 text-electricBlue flex items-center gap-2">
            <span className="text-neonGreen">📝</span> Register New Team
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
                label="Team Name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                placeholder="e.g. Thunder Smashers"
            />
            
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">Select Team Icon</label>
                <div className="flex gap-3 text-2xl overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-electricBlue/50">
                    {['🏸', '⚡', '🦅', '🐉', '🔥', '🛡️', '⚔️', '👑', '🚀', '🐯', '👿', '🤖'].map(emoji => (
                        <button 
                             key={emoji}
                             type="button"
                             onClick={() => setLogo(emoji)}
                             className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${logo === emoji ? 'bg-electricBlue text-white ring-2 ring-white scale-110 shadow-[0_0_10px_rgba(0,116,255,0.5)]' : 'bg-white/5 opacity-50 hover:opacity-100 hover:bg-white/10'}`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60">Squad Members (Min 2)</label>
                    <button type="button" onClick={handleAddMember} className="text-xs text-electricBlue font-bold hover:text-white transition-colors">+ ADD PLAYER</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {members.map((m, i) => (
                        <Input 
                            key={i}
                            placeholder={`Player ${i+1} Name`}
                            value={m}
                            onChange={e => handleMemberChange(i, e.target.value)}
                            required={i < 2}
                        />
                    ))}
                </div>
            </div>

            <Button type="submit" fullWidth disabled={!name || members.filter(m => m.trim()).length < 2} variant="success">
                Confirm Registration
            </Button>
        </form>
    </Card>
  );
};
