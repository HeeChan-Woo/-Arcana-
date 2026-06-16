import { BrowserRouter, Routes, Route } from 'react-router';
import { TarotProvider } from './context/TarotContext';
import { LandingPage } from './components/LandingPage';
import { CardSelectionPage } from './components/CardSelectionPage';
import { ReadingResultPage } from './components/ReadingResultPage';
import { DashboardPage } from './components/DashboardPage';

export default function App() {
  return (
    <TarotProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/reading" element={<CardSelectionPage />} />
          <Route path="/result" element={<ReadingResultPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </TarotProvider>
  );
}
