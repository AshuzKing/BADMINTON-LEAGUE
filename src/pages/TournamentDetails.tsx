import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTournaments } from '../hooks/useTournaments';
import { useTeams } from '../hooks/useTeams';
import { useMatches } from '../hooks/useMatches';
import { TeamRegistrationForm } from '../components/tournament/TeamRegistrationForm';
import { TeamCard } from '../components/team/TeamCard';
import { Button } from '../components/common/Button';
import { generateKnockoutBracket } from '../utils/bracketGenerator';

export const TournamentDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { tournaments } = useTournaments();
    const { teams, addTeam } = useTeams(id);
    const { matches, saveMatches } = useMatches(id);
    
    const [isAdmin, setIsAdmin] = useState(false);
    
    // Check admin
    useEffect(() => {
        setIsAdmin(localStorage.getItem('isAdmin') === 'true');
    }, []);
    
    const tournament = tournaments.find(t => t.id === id);

    if (!tournament) return <div>Tournament not found</div>;

    const handleGenerateMatches = () => {
        if (teams.length < 2) {
            alert('Need at least 2 teams to generate bracket!');
            return;
        }
        if (confirm('Generating matches will reset any existing bracket. Continue?')) {
            const newMatches = generateKnockoutBracket(id!, teams);
            saveMatches(newMatches);
            navigate(`/tournament/${id}/bracket`);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <Link to="/" className="text-white/50 hover:text-white mb-4 block text-sm font-bold uppercase tracking-wider">← Back to Dashboard</Link>
            
            <header className="mb-8">
                <span className="text-neonGreen font-bold tracking-widest text-xs uppercase mb-2 block">{tournament.date}</span>
                <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white mb-4 leading-none">{tournament.name}</h1>
                <div className="flex gap-4 items-center">
                    <span className="bg-white/10 px-3 py-1 rounded text-sm text-white/70">{teams.length} Teams Registered</span>
                    {matches.length > 0 && <span className="bg-electricBlue px-3 py-1 rounded text-sm font-bold text-white">Bracket Available</span>}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="mb-8">
                        <TeamRegistrationForm tournamentId={id!} onRegister={addTeam} />
                    </div>
                    
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold italic uppercase mb-6 text-white border-b border-white/10 pb-2">Registered Teams</h2>
                        {teams.length === 0 ? (
                            <div className="p-8 border border-dashed border-white/20 rounded text-center text-white/40 bg-white/5">
                                No teams yet. be the first to register!
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {teams.map(team => (
                                    <TeamCard key={team.id} team={team} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    {matches.length > 0 && (
                        <div className="bg-gradient-to-br from-electricBlue to-darkBlue p-6 rounded-lg text-center border border-white/10 shadow-[0_0_30px_rgba(0,116,255,0.2)]">
                            <h3 className="text-xl font-bold italic uppercase text-white mb-2">Tournament Live</h3>
                            <p className="text-sm text-white/70 mb-4">Bracket has been generated.</p>
                            <Link to={`/tournament/${id}/bracket`}>
                                <Button fullWidth variant="warning" className="shadow-lg">View Bracket</Button>
                            </Link>
                        </div>
                    )}
                    
                    {isAdmin && (
                        <div className="bg-darkBlue/50 border border-white/10 p-6 rounded-lg">
                            <h3 className="text-sm font-bold uppercase text-white/50 mb-4 border-b border-white/10 pb-2">Admin Controls</h3>
                            <Button 
                                fullWidth 
                                variant="primary" 
                                disabled={teams.length < 2}
                                onClick={handleGenerateMatches}
                            >
                                {matches.length > 0 ? 'Regenerate Bracket' : 'Generate Matches'}
                            </Button>
                            <p className="text-xs text-white/30 mt-2 text-center">Requires min 2 teams</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
