export interface Tournament {
  id: string;
  name: string;
  date: string;
  status: 'registration' | 'active' | 'completed';
  settings: {
    maxTeamMembers: number;
    format: 'knockout' | 'league';
  };
}

export interface Team {
  id: string;
  tournamentId: string;
  name: string;
  logo: string; // URL or emoji/icon identifier
  members: string[]; // Player names (max 2)
  color: string; // Team color (hex or named color)
}

export interface Match {
  id: string;
  tournamentId: string;
  round: number;
  teamA?: Team | null; // Populated team object
  teamAId?: string; // ID reference
  teamB?: Team | null;
  teamBId?: string;
  status: 'pending' | 'live' | 'completed';
  scoreA: number;
  scoreB: number;
  winnerId?: string;
  nextMatchId?: string;
}

export interface BracketNode {
  matchId: string;
  round: number;
  position: number;
}
