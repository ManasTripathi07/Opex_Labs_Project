import { Link, Outlet, useLocation } from 'react-router-dom';
import './Layout.css';

function Layout() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <h1>Production Tracker</h1>
          </div>
          <div className="navbar-links">
            <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
              Dashboard
            </Link>
            <Link to="/inbound" className={isActive('/inbound') ? 'active' : ''}>
              Inbound
            </Link>
            <Link to="/production" className={isActive('/production') ? 'active' : ''}>
              Production
            </Link>
            <Link to="/master-data" className={isActive('/master-data') ? 'active' : ''}>
              Master Data
            </Link>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
