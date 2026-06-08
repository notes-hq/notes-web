import { Link, NavLink, useLocation } from 'react-router-dom';

/**
 * Верхняя навигация приложения; пункт "Все заметки" остается активным и на /edit/:id.
 */
export default function Header() {
  const location = useLocation();
  const notesActive = location.pathname === '/' || location.pathname.startsWith('/edit/');
  const createActive = location.pathname === '/create';

  return (
    <header className="app-header">
      <Link className="brand-link" to="/">
        Заметки
      </Link>
      <nav className="top-nav" aria-label="Основная навигация">
        <NavLink className={notesActive ? 'nav-link active' : 'nav-link'} to="/">
          Все заметки
        </NavLink>
        <NavLink className={createActive ? 'nav-link active' : 'nav-link'} to="/create">
          Новая заметка
        </NavLink>
      </nav>
    </header>
  );
}
