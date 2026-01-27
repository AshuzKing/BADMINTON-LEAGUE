import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { TournamentList } from './pages/TournamentList';
import { TournamentDetails } from './pages/TournamentDetails';
import { BracketView } from './pages/BracketView';
import { TournamentResults } from './pages/TournamentResults';
import { TournamentProvider } from './hooks/useTournamentsFirebase';
import { TeamProvider } from './hooks/useTeamsFirebase';
import { MatchProvider } from './hooks/useMatchesFirebase';

function App() {
  return (
    <TournamentProvider>
      <TeamProvider>
        <MatchProvider>
          <Router>
            <div className="min-h-screen bg-darkBlue text-white font-sans selection:bg-electricBlue selection:text-white overflow-x-hidden relative">
              {/* Background Grid Accent */}
              <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

              <Navbar />
              <main className="w-full relative z-10">
                <Routes>
                  <Route path="/" element={<TournamentList />} />
                  <Route path="/tournament/:id" element={<TournamentDetails />} />
                  <Route path="/tournament/:id/bracket" element={<BracketView />} />
                  <Route path="/tournament/:id/results" element={<TournamentResults />} />
                </Routes>
              </main>
            </div>
          </Router>
        </MatchProvider>
      </TeamProvider>
    </TournamentProvider>
  );
}

export default App;
