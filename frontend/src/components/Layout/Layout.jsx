import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import { UserContext } from '../../context/userContext';
import { useTheme } from '../../context/themeContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPath';
import '../../pages/Dashboard/dashboard.css';

const timeAgo = (iso) => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const Layout = ({ children }) => {
  const { user, logout } = useContext(UserContext);
  const { theme, toggleTheme } = useTheme();
  const [time, setTime] = useState(new Date());
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifs, setNotifs] = useState({ unread: 0, items: [] });
  const bellRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // ---- notifications: load now, then poll so a friend's split shows up without refresh
  const loadNotifs = useCallback(async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.NOTIFICATIONS);
      setNotifs(res.data);
    } catch (err) {
      console.error('Notification fetch error:', err);
    }
  }, []);

  useEffect(() => {
    loadNotifs();
    const t = setInterval(loadNotifs, 15000);
    return () => clearInterval(t);
  }, [loadNotifs]);

  // close the bell dropdown when clicking elsewhere
  useEffect(() => {
    const onDoc = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setShowNotif(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const toggleBell = async () => {
    const opening = !showNotif;
    setShowNotif(opening);
    setShowDropdown(false);
    if (opening) {
      try {
        const res = await axiosInstance.get(API_PATHS.NOTIFICATIONS);
        setNotifs(res.data);
        if (res.data.unread > 0) {
          await axiosInstance.put(`${API_PATHS.NOTIFICATIONS}/read-all`);
          setNotifs((n) => ({ ...n, unread: 0 })); // clear the badge; items keep their highlight while open
        }
      } catch (err) {
        console.error('Notification fetch error:', err);
      }
    }
  };

  const respond = async (id, action) => {
    try {
      await axiosInstance.post(`${API_PATHS.NOTIFICATIONS}/${id}/${action}`);
      await loadNotifs();
      // let open pages (Expense, Dashboard...) know new data exists
      window.dispatchEvent(new Event('data-changed'));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update this request');
    }
  };

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
    <div className="dashboard-app" data-theme={theme}>
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
            {/* Dark / light toggle */}
            <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} aria-label="Toggle theme">
              {theme === 'dark' ? (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* Bell icon + notifications dropdown */}
            <div className="bell-wrap" ref={bellRef}>
              <button className="bell-btn" title="Notifications" onClick={toggleBell}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>
              {notifs.unread > 0 && <span className="bell-count">{notifs.unread > 9 ? '9+' : notifs.unread}</span>}

              {showNotif && (
                <div className="notif-dropdown">
                  <div className="notif-head">
                    <span>Notifications</span>
                  </div>
                  <div className="notif-list">
                    {notifs.items.length === 0 ? (
                      <div className="notif-empty">No notifications yet</div>
                    ) : notifs.items.map((n) => (
                      <div key={n._id} className={`notif-item ${n.read ? '' : 'unread'}`}>
                        <div>{n.message}</div>
                        <div className="notif-time">{timeAgo(n.createdAt)}</div>
                        {n.type === 'split_request' && n.status === 'pending' && (
                          <div className="notif-actions">
                            <button className="notif-btn accept" onClick={() => respond(n._id, 'accept')}>Accept &amp; add to expenses</button>
                            <button className="notif-btn decline" onClick={() => respond(n._id, 'decline')}>Decline</button>
                          </div>
                        )}
                        {n.type === 'split_request' && n.status !== 'pending' && (
                          <span className={`notif-status ${n.status}`}>{n.status === 'accepted' ? 'Accepted' : 'Declined'}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User chip + dropdown */}
            <div className="user-chip" onClick={() => { setShowDropdown(!showDropdown); setShowNotif(false); }}>
              <div className="avatar">{user?.fullName?.substring(0, 2).toUpperCase() || 'ME'}</div>
              <div className="user-name">{user?.fullName || 'Student'}</div>
              <span className="chevron">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" /></svg>
              </span>

              {showDropdown && (
                <div className="user-dropdown" onClick={e => e.stopPropagation()}>
                  <div className="user-dropdown-item" onClick={goToProfile}>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>
                    Profile
                  </div>
                  <div className="user-dropdown-divider"></div>
                  <div className="user-dropdown-item danger" onClick={handleLogout}>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" /></svg>
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
