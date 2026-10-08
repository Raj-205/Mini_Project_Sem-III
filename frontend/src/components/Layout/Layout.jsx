import { useContext, useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { UserContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import '../../pages/Dashboard/dashboard.css';

const Layout = ({ children }) => {
  const { user, logout } = useContext(UserContext);
  const [time, setTime] = useState(new Date());
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
    navigate('/login');
  };

  const goToProfile = () => {
    setShowDropdown(false);
    navigate('/profile');
  };

  return (
    <div className="dashboard-app">
      <Sidebar />
      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-date">{dateStr} &mdash; {timeStr}</div>
            <div className="topbar-title">
              Welcome, {user?.fullName || 'Student'} <span className="dot-accent">•</span>
            </div>
          </div>

          <div className="topbar-right">
            {/* Bell icon */}
            <button className="bell-btn" title="Notifications">
              <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="bell-dot"></span>
            </button>

            {/* User chip + dropdown */}
            <div className="user-chip" onClick={() => setShowDropdown(!showDropdown)}>
              <div className="avatar">{user?.fullName?.substring(0, 2).toUpperCase() || 'ME'}</div>
              <div className="user-name">{user?.fullName || 'Student'}</div>
              <span className="chevron">
                <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
              </span>

              {showDropdown && (
                <div className="user-dropdown" onClick={e => e.stopPropagation()}>
                  <div className="user-dropdown-item" onClick={goToProfile}>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                    Profile
                  </div>
                  <div className="user-dropdown-divider"></div>
                  <div className="user-dropdown-item danger" onClick={handleLogout}>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default Layout;
