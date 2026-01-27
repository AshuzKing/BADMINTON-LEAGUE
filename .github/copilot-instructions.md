# Badminton Tournament Platform - AI Instructions

## Project Overview
This represents a high-adrenaline, esports-style badminton tournament management system built with React and Vite. It is a client-side only application relying entirely on `localStorage` for persistence.

## Tech Stack & Architecture
- **Framework:** React 18+ with Vite
- **Language:** TypeScript (Preferred) or JavaScript
- **Routing:** React Router DOM
- **State/Persistence:** All data (Tournaments, Teams, Matches, Brackets) must persist to `localStorage`. No backend database.
- **Styling:** Tailwind CSS (recommended for speed) or Custom CSS.
- **Design System:** "Esports" vibe - bold, high contrast, energetic.

## Core Data Models (LocalStorage)
Maintain normalized structures in `localStorage`. Example keys and shapes:
- `tournaments`: Array of tournament objects.
- `teams`: Array of teams linked to tournament IDs.
- `matches`: Array of match objects with status (`pending`, `live`, `completed`), scores, and progression logic.

## Design & UI Guidelines
**Mood:** High-adrenaline, competitive, speed, impact.

**Color Palette (Strict):**
- Dark Blue: `#002a5e` (Backgrounds)
- Electric Blue: `#0074ff` (Actions/Links)
- Neon Green: `#00ff85` (Success/Winners)
- Championship Yellow: `#ffdd00` (Highlights/Trophies)
- White: `#ffffff` (Text)

**Components:**
- Use bold typography and sharp edges for cards.
- Implement glowing hover effects.
- Ensure mobile responsiveness.

## Critical Workflows
1.  **Tournament Creation:** Admin creates a tournament (Name, Date).
2.  **Registration:** Users register teams (Name, Logo, Members) -> Save to LocalStorage.
3.  **Match Generation:** Admin triggers random match generation (Knockout/League format).
4.  **Live Scoring:** Admin updates scores in real-time -> Visual feedback (Neon Green for winner) -> Auto-advance winner.

## Coding Conventions
- **No Backend:** Do not suggest Express, Node.js, or external DBs. Everything is local.
- **Modularity:** Separate `components` (UI) from `hooks` (logic/storage).
- **Storage Hooks:** Create custom hooks (e.g., `useLocalStorage`, `useTournamentData`) to abstract raw `localStorage` calls.
- **Routing:** Use readable routes like `/tournament/:id`, `/tournament/:id/bracket`.
