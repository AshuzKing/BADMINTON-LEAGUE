import { Link } from 'react-router-dom';
import { Tournament } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const TournamentCard = ({ tournament, onDelete, isAdmin }: { tournament: Tournament, onDelete: (id: string) => void, isAdmin: boolean }) => {
  return (
    <Card className="h-full flex flex-col p-4 sm:p-5">
      <div className="flex justify-between items-start mb-4 gap-3">
        <Badge status={tournament.status} />
        <span className="text-xs sm:text-sm text-white/50 font-mono whitespace-nowrap">{tournament.date}</span>
      </div>
      
      <h3 className="text-base sm:text-lg font-black italic uppercase mb-2 text-white line-clamp-2">{tournament.name}</h3>
      <div className="mb-6 flex-grow">
          <p className="text-xs sm:text-sm text-white/60">Format: {tournament.settings.format} • Max {tournament.settings.maxTeamMembers}</p>
      </div>

      <div className="flex gap-2 mt-auto">
        <Link to={`/tournament/${tournament.id}`} className="flex-1">
            <Button fullWidth variant="primary" className="text-xs sm:text-sm">View Arena</Button>
        </Link>
        
        {isAdmin && (
            <Button 
                variant="danger"
                className="px-2 sm:px-3 text-xs sm:text-sm touch-target"
                onClick={(e) => {
                    e.preventDefault();
                    if(confirm('Delete tournament?')) onDelete(tournament.id);
                }}
                aria-label="Delete tournament"
            >
                ✕
            </Button>
        )}
      </div>
    </Card>
  );
};
