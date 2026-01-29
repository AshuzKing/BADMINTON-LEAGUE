import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTournaments } from '../hooks/useTournamentsFirebase';
import { useTeams } from '../hooks/useTeamsFirebase';
import { useMatches } from '../hooks/useMatchesFirebase';
import { TeamRegistrationForm } from '../components/tournament/TeamRegistrationForm';
import { TeamCard } from '../components/team/TeamCard';
import { Button } from '../components/common/Button';
import { generateKnockoutBracket } from '../utils/bracketGenerator';

export const TournamentDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { tournaments, updateTournament } = useTournaments();
    const { teams, addTeam, deleteTeam } = useTeams(id);
    const { matches, saveMatches, deleteMatches } = useMatches(id);

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
            // Auto set status to active if not already
            if (tournament.status === 'registration') {
                updateTournament(id!, { status: 'active' });
            }
            navigate(`/tournament/${id}/bracket`);
        }
    };

    const handleDeleteBracket = async () => {
        if (!confirm('Delete the current bracket? This will remove all match data but keep teams and tournament.')) return;
        try {
            await deleteMatches();
            // Optionally set tournament back to registration
            updateTournament(id!, { status: 'registration' });
        } catch (err) {
            console.error('Failed to delete bracket', err);
            alert('Failed to delete bracket. See console for details.');
        }
    };

    return (
        <div className="container-safe">
            <Link to="/" className="text-white/50 hover:text-white mb-4 block text-xs sm:text-sm font-bold uppercase tracking-wider">← Back to Dashboard</Link>

            <header className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div className="w-full">
                        <span className="text-neonGreen font-bold tracking-widest text-xs uppercase mb-2 block">{tournament.date}</span>
                        <h1 className="mb-4">{tournament.name}</h1>
                    </div>
                    {isAdmin && (
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            {(['registration', 'active', 'completed'] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => updateTournament(id!, { status: s })}
                                    className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-bold uppercase rounded border touch-target ${tournament.status === s
                                            ? 'bg-neonGreen text-darkBlue border-neonGreen'
                                            : 'bg-transparent text-white/50 border-white/10 hover:border-white/30'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
                    <span className="bg-white/10 px-3 py-1.5 rounded text-xs sm:text-sm text-white/70 touch-target">{teams.length} Teams</span>
                    {matches.length > 0 && <span className="bg-electricBlue px-3 py-1.5 rounded text-xs sm:text-sm font-bold text-white touch-target">Bracket ✓</span>}
                    <span className={`px-3 py-1.5 rounded text-xs sm:text-sm font-bold uppercase touch-target ${tournament.status === 'active' ? 'bg-red-500 text-white animate-pulse' :
                            tournament.status === 'completed' ? 'bg-gray-500 text-white' : 'bg-green-500 text-darkBlue'
                        }`}>
                        {tournament.status === 'active' ? '● LIVE' : tournament.status}
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        {/* Only show registration form if in registration mode or admin */}
                        {(tournament.status === 'registration' || isAdmin) && (
                            <TeamRegistrationForm tournamentId={id!} onRegister={addTeam} existingTeams={teams} />
                        )}
                    </div>

                    <div>
                        <h2 className="text-lg sm:text-2xl font-bold italic uppercase mb-4 sm:mb-6 text-white border-b border-white/10 pb-2">Registered Teams</h2>
                        {teams.length === 0 ? (
                            <div className="p-6 sm:p-8 border border-dashed border-white/20 rounded text-center text-white/40 bg-white/5">
                                <p className="text-sm sm:text-base">No teams yet. be the first to register!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {teams.map(team => (
                                    <TeamCard
                                        key={team.id}
                                        team={team}
                                        isAdmin={isAdmin}
                                        onDelete={deleteTeam}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                    {matches.length > 0 && (
                        <div className="bg-gradient-to-br from-electricBlue to-darkBlue p-4 sm:p-6 rounded-lg text-center border border-white/10 shadow-[0_0_30px_rgba(0,116,255,0.2)]">
                            <h3 className="text-base sm:text-lg font-bold italic uppercase text-white mb-2">Tournament Live</h3>
                            <p className="text-xs sm:text-sm text-white/70 mb-4">Bracket has been generated.</p>
                            <div className="space-y-2">
                                <Link to={`/tournament/${id}/bracket`}>
                                    <Button fullWidth variant="warning" className="shadow-lg text-xs sm:text-sm">View Bracket</Button>
                                </Link>
                                {matches.some(m => m.status === 'completed') && (
                                    <Link to={`/tournament/${id}/results`}>
                                        <Button fullWidth variant="success" className="shadow-lg text-xs sm:text-sm">View Results 📊</Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {isAdmin && (
                        <div className="bg-darkBlue/50 border border-white/10 p-4 sm:p-6 rounded-lg">
                            <h3 className="text-xs font-bold uppercase text-white/50 mb-4 border-b border-white/10 pb-2">Admin Controls</h3>
                            <Button
                                fullWidth
                                variant="primary"
                                disabled={teams.length < 2}
                                onClick={handleGenerateMatches}
                                className="text-xs sm:text-sm"
                            >
                                {matches.length > 0 ? 'Regenerate' : 'Generate Matches'}
                            </Button>
                            {matches.length > 0 && (
                                <Button
                                    fullWidth
                                    variant="danger"
                                    onClick={handleDeleteBracket}
                                    className="mt-2 text-xs sm:text-sm"
                                >
                                    Delete Bracket
                                </Button>
                            )}
                            <p className="text-xs text-white/30 mt-2 text-center">Requires min 2 teams</p>

                            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                                <p className="text-xs text-center text-white/40">Force Status Update</p>
                                <Button
                                    variant="ghost"
                                    fullWidth
                                    onClick={() => updateTournament(id!, { status: 'registration' })}
                                    className="text-xs sm:text-sm"
                                >
                                    Reset to Registration
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
