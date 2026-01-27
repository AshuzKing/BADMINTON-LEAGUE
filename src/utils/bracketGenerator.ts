import { Team, Match } from '../types';

export const generateKnockoutBracket = (tournamentId: string, teams: Team[]): Match[] => {
  if (teams.length < 2) return [];

  // Shuffle teams randomly
  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

  const matches: Match[] = [];
  const totalTeams = shuffledTeams.length;
  
  // Calculate power of 2 size
  let bracketSize = 2;
  while (bracketSize < totalTeams) {
    bracketSize *= 2;
  }

  // 1. Calculate Rounds needed
  const totalRounds = Math.log2(bracketSize);
  
  const matchesByRound: Match[][] = [];

  // Generate all placeholder matches structure
  for (let r = 1; r <= totalRounds; r++) {
    const matchesInRound = bracketSize / Math.pow(2, r);
    const roundMatches: Match[] = [];
    
    for (let i = 0; i < matchesInRound; i++) {
      roundMatches.push({
        id: `match-${tournamentId}-r${r}-${i}`,
        tournamentId,
        round: r,
        status: 'pending',
        scoreA: 0,
        scoreB: 0,
        teamA: null,
        teamB: null,
      } as Match);
    }
    matchesByRound.push(roundMatches);
    matches.push(...roundMatches);
  }

  // Link matches (nextMatchId)
  // Round r matches feed into Round r+1
  for (let r = 0; r < totalRounds - 1; r++) {
    const currentRound = matchesByRound[r];
    const nextRound = matchesByRound[r + 1];
    
    currentRound.forEach((match, index) => {
      const nextMatchIndex = Math.floor(index / 2);
      match.nextMatchId = nextRound[nextMatchIndex].id;
    });
  }

  // Populate Teams into Round 1
  const round1 = matchesByRound[0];
  let teamIndex = 0;
  
  round1.forEach(match => {
    if (teamIndex < shuffledTeams.length) {
      match.teamA = shuffledTeams[teamIndex++];
      match.teamAId = match.teamA.id;
    }
    
    if (teamIndex < shuffledTeams.length) {
      match.teamB = shuffledTeams[teamIndex++];
      match.teamBId = match.teamB.id;
    }
  });

  // Post-processing for BYEs (Automatic advancement)
  const advanceByes = (currentMatches: Match[]) => {
      let changed = false;
      currentMatches.forEach(m => {
          // If match is pending and has Team A but NO Team B => Auto win for Team A
          if (m.status === 'pending' && m.teamA && !m.teamB) {
              m.status = 'completed';
              m.winnerId = m.teamA.id;
              
              // Advance to next match
              if (m.nextMatchId) {
                  const nextMatch = currentMatches.find(nm => nm.id === m.nextMatchId);
                  if (nextMatch) {
                      // Determine slot A or B based on index
                      // ID format: ...-r{r}-{index}
                      const parts = m.id.split('-');
                      const idx = parseInt(parts[parts.length-1]);
                      const isSlotA = idx % 2 === 0;

                      if (isSlotA) {
                          nextMatch.teamA = m.teamA;
                          nextMatch.teamAId = m.teamA!.id;
                      } else {
                          nextMatch.teamB = m.teamA;
                          nextMatch.teamBId = m.teamA!.id;
                      }
                      changed = true;
                  }
              }
          }
      });
      if (changed) advanceByes(currentMatches);
  };

  advanceByes(matches);

  return matches;
};
