import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ExamConfirmPage from './pages/ExamConfirmPage';
import ExamPage from './pages/ExamPage';
import ResultsPage from './pages/ResultsPage';
import LoginPage from './pages/LoginPage';
import HistoryPage from './pages/HistoryPage';

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/exam/:paperId/confirm" element={<ExamConfirmPage />} />
            <Route path="/exam/:paperId/attempt" element={<ExamPage />} />
            <Route path="/exam/:paperId/results" element={<ResultsPage />} />
        </Routes>
    );
}

export default App;
