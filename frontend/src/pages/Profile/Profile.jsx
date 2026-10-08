import { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../context/userContext';

const Profile = () => {
  const { user, login } = useContext(UserContext);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.fullName || '',
        phone: user.phone || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Simulate updating user profile
    const updatedUser = { ...user, fullName: formData.name, phone: formData.phone, email: formData.email };
    login(updatedUser, localStorage.getItem('token'));
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Profile</div>
          <div className="page-sub">Manage your account details</div>
        </div>
      </div>

      <div className="form-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h3 style={{ marginBottom: '24px' }}>Edit Details</h3>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', outline: 'none' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', outline: 'none' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>Phone Number</label>
            <input 
              type="number" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', outline: 'none' }} 
            />
          </div>

          {message && <div style={{ padding: '12px', background: '#dcfce7', color: '#166534', borderRadius: '8px', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>{message}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" className="btn-save">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
