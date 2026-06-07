import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header.jsx';
import NotesPage from './pages/NotesPage.jsx';
import CreateNotePage from './pages/CreateNotePage.jsx';
import EditNotePage from './pages/EditNotePage.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<NotesPage />} />
          <Route path="/create" element={<CreateNotePage />} />
          <Route path="/edit/:id" element={<EditNotePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
