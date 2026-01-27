import { Team } from '../../types';
import { Card } from '../common/Card';

export const TeamCard = ({ team }: { team: Team }) => {
  return (
    <Card className="p-4 border-l-4 border-l-electricBlue h-full">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-2xl">
                {team.logo || '🏸'}
            </div>
            <div>
                <h4 className="font-bold text-lg leading-tight text-white">{team.name}</h4>
                <p className="text-xs text-white/50">{team.members.length} Members</p>
            </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
            {team.members.map((m, i) => (
                <span key={i} className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/70 border border-white/5">{m}</span>
            ))}
        </div>
    </Card>
  );
};
