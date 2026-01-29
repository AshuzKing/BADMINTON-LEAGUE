import { Team, Match } from '../types';

export const generateKnockoutBracket = (tournamentId: string, teams: Team[]): Match[] => {
  if (teams.length < 2) return [];

  // Shuffle teams randomly
  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

  const matches: Match[] = [];
  const totalTeams = shuffledTeams.length;
  // Special handling for 6-team tournaments: create 3 matches in round 1,
  // then 1 semifinal (between winners of matches 2 and 3), and 1 final.
  if (totalTeams === 6) {
    const matchesByRound: Match[][] = [];

    // Round 1: three head-to-head matches
    const round1: Match[] = [];
    for (let i = 0; i < 3; i++) {
      round1.push({
        id: `match-${tournamentId}-r1-${i}`,
        tournamentId,
        round: 1,
        status: 'pending',
        scoreA: 0,
        scoreB: 0,
        teamA: null,
        teamB: null,
      } as Match);
    }

    // Round 2: one semifinal (between winners of match 1 and match 2)
    const round2: Match[] = [
      {
        id: `match-${tournamentId}-r2-0`,
        tournamentId,
        round: 2,
        status: 'pending',
        scoreA: 0,
        scoreB: 0,
        teamA: null,
        teamB: null,
      } as Match,
    ];

    // Round 3: final
    const round3: Match[] = [
      {
        id: `match-${tournamentId}-r3-0`,
        tournamentId,
        round: 3,
        status: 'pending',
        scoreA: 0,
        scoreB: 0,
        teamA: null,
        teamB: null,
      } as Match,
    ];

    // Link nextMatchId: match1 and match2 feed into semifinal, match0 feeds to final.
    // Indexing: round1[0] = match A, [1] = match B, [2] = match C
    round1[0].nextMatchId = round3[0].id; // winner of match A may go to final directly
    round1[1].nextMatchId = round2[0].id; // winner of match B -> semifinal
    round1[2].nextMatchId = round2[0].id; // winner of match C -> semifinal
    round2[0].nextMatchId = round3[0].id; // semifinal winner -> final

    // Populate teams into round1
    let tIndex = 0;
    round1.forEach((m) => {
      if (tIndex < shuffledTeams.length) {
        m.teamA = shuffledTeams[tIndex++];
        m.teamAId = m.teamA.id;
      }
      if (tIndex < shuffledTeams.length) {
        m.teamB = shuffledTeams[tIndex++];
        m.teamBId = m.teamB.id;
      }
    });

    matchesByRound.push(round1, round2, round3);
    matches.push(...round1, ...round2, ...round3);

    return matches;
  }

  // Fallback: original power-of-two bracket generation for other sizes
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
