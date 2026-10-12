import { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPath';

const Profile = () => {
  const { user, login } = useContext(UserContext);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', mobileNo: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // fill the form from the saved registration data
  const fillForm = () => setFormData({
    fullName: user?.fullName || '',
    email: user?.email || '',
    mobileNo: user?.mobileNo || '',
  });
  useEffect(() => { if (user) fillForm(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const startEdit = () => { fillForm(); setError(''); setMessage(''); setEditing(true); };
  const cancelEdit = () => { fillForm(); setError(''); setEditing(false); };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await axiosInstance.put(API_PATHS.AUTH_ME, formData);
      login(res.data, localStorage.getItem('token')); // refresh the user everywhere (top bar, etc.)
      setEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.fullName?.substring(0, 2).toUpperCase() || 'ME';

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Profile</div>
          <div className="page-sub">Your account details</div>
        </div>
      </div>

      <div className="form-card profile-card">
        <div className="profile-head">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-head-info">
            <div className="profile-name">{user?.fullName}</div>
            <div className="profile-username">@{user?.username}</div>
          </div>
          {!editing && (
            <button type="button" className="btn-add" onClick={startEdit}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>
              Edit
            </button>
          )}
        </div>

        {message && <div className="profile-msg ok">{message}</div>}
        {error && <div className="profile-msg err">{error}</div>}

        {!editing ? (
          /* ---------- read-only view of the registration data ---------- */
          <div className="profile-fields">
            <div className="profile-field"><label>Username</label><div className="profile-value">{user?.username || '—'}</div></div>
            <div className="profile-field"><label>Full Name</label><div className="profile-value">{user?.fullName || '—'}</div></div>
            <div className="profile-field"><label>Email Address</label><div className="profile-value">{user?.email || '—'}</div></div>
            <div className="profile-field"><label>Mobile Number</label><div className="profile-value">{user?.mobileNo || 'Not provided'}</div></div>
          </div>
        ) : (
          /* ---------- edit mode ---------- */
          <form onSubmit={handleSave} className="profile-fields">
            <div className="profile-field">
              <label>Username</label>
              <input type="text" value={user?.username || ''} disabled />
              <small>Username cannot be changed (friends find you by it).</small>
            </div>
            <div className="profile-field">
              <label>Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className="profile-field">
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="profile-field">
              <label>Mobile Number</label>
              <input type="tel" name="mobileNo" value={formData.mobileNo} onChange={handleChange} inputMode="numeric" pattern="\d{7,15}" title="7 to 15 digits" />
            </div>
            <div className="form-actions" style={{ marginTop: '6px' }}>
              <button type="button" className="btn-cancel" onClick={cancelEdit}>Cancel</button>
              <button type="submit" className="btn-save-green" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
