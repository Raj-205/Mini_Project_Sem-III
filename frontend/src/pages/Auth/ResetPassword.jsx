import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPath';
import './auth.css';

const ResetPassword = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEPin, setNewEPin] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!username || !email) {
      setError('Please enter your username and email first.');
      return;
    }
    try {
      const res = await axiosInstance.post(API_PATHS.AUTH_FORGOT, { username, email });
      setMessage(res.data.message);
      setOtpSent(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
      setMessage('');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post(API_PATHS.AUTH_RESET, { username, otp, newPassword, newEPin });
      setMessage(res.data.message);
      setError('');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
      setMessage('');
    }
  };

  return (
    <div className="auth-container-bg">
      <div className="auth-circle" id="cr1"></div>
      <div className="auth-circle" id="cr2"></div>
      <div className="auth-circle" id="cr3"></div>
      <div className="auth-circle" id="cr4"></div>
      <div className="auth-box">
        <div className="auth-left">
          <h1 style={{fontSize:'26px'}}>Reset Password / E PIN</h1>
          <form className="login-form" onSubmit={handleVerify}>

            <label>Username <span style={{color:'red'}}>*</span></label>
            <input type="text" placeholder="Enter Your Username" value={username} onChange={e => setUsername(e.target.value)} required />

            <label>Registered Email <span style={{color:'red'}}>*</span></label>
            <input type="email" placeholder="Enter Your Registered Email" value={email} onChange={e => setEmail(e.target.value)} required />

            {/* OTP row */}
            <div className="otp-row">
              <div className="otp-field">
                <label>OTP</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  required
                />
              </div>
              <button type="button" className="otp-send-btn" onClick={handleSendOtp}>
                {otpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
            </div>

            {otpSent && (
              <>
                <label>New Password</label>
                <input type="password" placeholder="Enter New Password (optional)" value={newPassword} onChange={e => setNewPassword(e.target.value)} />

                <label>New E-PIN</label>
                <input type="number" placeholder="Enter New 6-digit E-PIN (optional)" value={newEPin} onChange={e => setNewEPin(e.target.value)} />
              </>
            )}

            <button type="submit" className="auth-btn" disabled={!otpSent} style={{ opacity: otpSent ? 1 : 0.5 }}>
              Verify &amp; Reset
            </button>

            {message && <p style={{color:'green', textAlign:'center', marginTop:'10px', fontWeight:'bold'}}>{message}</p>}
            {error && <p style={{color:'red', textAlign:'center', marginTop:'10px'}}>{error}</p>}
          </form>
          <p className="signup-link">Remembered? <Link to="/login">Login</Link></p>
        </div>
        <div className="auth-right">
          <img src="/logo.jpeg" alt="SET Logo" />
        </div>
      </div>
    </div>
  );
};
export default ResetPassword;
