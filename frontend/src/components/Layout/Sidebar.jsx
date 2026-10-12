import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../../context/userContext';

const Sidebar = () => {
  const { user } = useContext(UserContext);

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand">
        <div className="brand-icon">S</div>
        <div className="brand-name">SET</div>
      </div>
      {/* Quiet Card */}
      <div className="quiet-card">
        <div className="quiet-top">
          <span>Quiet Hour</span>
          <span className="quiet-dot"></span>
        </div>
        <div className="quiet-title">Quiet hour is on.</div>
        <div className="quiet-sub">A softer way to close out the day.</div>
      </div>

      {/* Navigation */}
      <div className="nav-label">your desk</div>
      <nav className="nav">
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-ic">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
          </span>
          Overview
        </NavLink>

        <NavLink to="/income" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-ic">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
            </svg>
          </span>
          Income
        </NavLink>

        <NavLink to="/expense" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-ic">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z"/>
            </svg>
          </span>
          Expenses
        </NavLink>
        <NavLink to="/splits" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-ic">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 4l2.29 2.29-2.88 2.88 1.42 1.42 2.88-2.88L20 10V4zm-4 0H4v6l2.29-2.29 4.71 4.7V20h2v-8.41L7.71 6.29z"/>
            </svg>
          </span>
          Splits
        </NavLink>

        <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-ic">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
            </svg>
          </span>
          History
        </NavLink>

        <NavLink to="/analysis" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-ic">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
            </svg>
          </span>
          Analysis
        </NavLink>
      </nav>

      {/* Horizontal divider separates nav from focus mode */}
      <div className="sidebar-divider"></div>

      {/* Focus Mode — below the divider */}
      <div className="sidebar-bottom">
        <button className="focus-mode">
          <span>Focus mode</span>
          <span className="focus-dot"></span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
