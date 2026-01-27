import { useState, useEffect } from 'react';
import { useTournaments } from '../hooks/useTournaments';
import { TournamentCard } from '../components/tournament/TournamentCard';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';

export const TournamentList = () => {
  const { tournaments, addTournament, deleteTournament } = useTournaments();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTournamentName, setNewTournamentName] = useState('');

  // Listen for admin changes
  useEffect(() => {
    const checkAdmin = () => setIsAdmin(localStorage.getItem('isAdmin') === 'true');
    checkAdmin();
    window.addEventListener('adminChange', checkAdmin);
    return () => window.removeEventListener('adminChange', checkAdmin);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTournamentName) return;
    
    addTournament({
      id: crypto.randomUUID(),
      name: newTournamentName,
      date: new Date().toLocaleDateString(),
      status: 'registration',
      settings: {
        maxTeamMembers: 4,
        format: 'knockout'
      }
    });
    setNewTournamentName('');
    setShowAddModal(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2">My Tournaments</h1>
            <p className="text-white/60">Manage and view your badminton championships</p>
        </div>
        
        {isAdmin && (
            <Button onClick={() => setShowAddModal(!showAddModal)}>
                + New Tournament
            </Button>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="w-full max-w-md bg-darkBlue border-electricBlue shadow-[0_0_50px_rgba(0,116,255,0.3)]">
                <h2 className="text-2xl font-bold italic uppercase mb-6 text-white">Create Tournament</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                    <Input 
                        label="Tournament Name" 
                        value={newTournamentName}
                        onChange={e => setNewTournamentName(e.target.value)}
                        autoFocus
                    />
                    <div className="flex gap-3 justify-end mt-6">
                        <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
                        <Button type="submit" variant="primary">Create Event</Button>
                    </div>
                </form>
            </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.length === 0 ? (
           <div className="col-span-3 text-center py-12 border border-white/10 border-dashed rounded bg-white/5">
               <p className="text-white/50">No tournaments found.</p>
           </div>
        ) : (
             tournaments.map(t => (
              <TournamentCard 
                key={t.id} 
                tournament={t} 
                onDelete={deleteTournament}
                isAdmin={isAdmin}
              />
            ))
        )}
      </div>
    </div>
  );
};
