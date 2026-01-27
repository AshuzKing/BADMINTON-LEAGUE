import { Tournament } from '../types';

export const initializeApp = () => {
  if (typeof window === 'undefined') return;
  
  const existing = localStorage.getItem('tournaments');
  if (!existing) {
    const defaultTournament: Tournament = {
      id: '1',
      name: 'Shuttle Smash Championship 2026',
      date: '2026-02-01',
      status: 'registration',
      settings: {
        maxTeamMembers: 4,
        format: 'knockout',
      },
    };
    localStorage.setItem('tournaments', JSON.stringify([defaultTournament]));
  }
};
