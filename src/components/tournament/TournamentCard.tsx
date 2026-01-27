import { Link } from 'react-router-dom';
import { Tournament } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const TournamentCard = ({ tournament, onDelete, isAdmin }: { tournament: Tournament, onDelete: (id: string) => void, isAdmin: boolean }) => {
  return (
    <Card className="h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <Badge status={tournament.status} />
        <span className="text-sm text-white/50 font-mono">{tournament.date}</span>
      </div>
      
      <h3 className="text-xl font-black italic uppercase mb-2 text-white">{tournament.name}</h3>
      <div className="mb-6 flex-grow">
          <p className="text-sm text-white/60">Format: {tournament.settings.format} • Max {tournament.settings.maxTeamMembers} Players</p>
      </div>

      <div className="flex gap-2 mt-auto">
        <Link to={`/tournament/${tournament.id}`} className="flex-1">
            <Button fullWidth variant="primary" className="text-sm">View Arena</Button>
        </Link>
        
        {isAdmin && (
            <Button 
                variant="danger" 
                className="px-3"
                onClick={(e) => {
                    e.preventDefault();
                    if(confirm('Delete tournament?')) onDelete(tournament.id);
                }}
            >
                ✕
            </Button>
        )}
      </div>
    </Card>
  );
};
