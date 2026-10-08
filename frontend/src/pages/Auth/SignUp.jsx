import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPath';
import './auth.css';

const SignUp = () => {
  const [formData, setFormData] = useState({ username: '', name: '', mobileNo: '', email: '', password: '', E_pin: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const update = (key) => (e) => setFormData({ ...formData, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(API_PATHS.AUTH_REGISTER, formData);
      setMessage('Registration Successful!');
      setError('');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
        <div className="auth-left" style={{padding:'35px 45px'}}>
          <h1>Sign Up</h1>
          <form className="login-form" onSubmit={handleSubmit}>
            <label>UserName <span style={{color:'red'}}>*</span></label>
            <input type="text" placeholder="Enter Your UserName" value={formData.username} onChange={update('username')} required />

            <label>Name <span style={{color:'red'}}>*</span></label>
            <input type="text" placeholder="Enter Your Name" value={formData.name} onChange={update('name')} required />

            <label>Phone Number <span style={{color:'red'}}>*</span></label>
            <input type="number" placeholder="Enter Your 10 Digit Phone Number" value={formData.mobileNo} onChange={update('mobileNo')} required />

            <label>Email <span style={{color:'red'}}>*</span></label>
            <input type="email" placeholder="Enter Your Email" value={formData.email} onChange={update('email')} required />

            <label>Password <span style={{color:'red'}}>*</span></label>
            <input type="password" placeholder="Enter Your Password" value={formData.password} onChange={update('password')} required />

            <label>E Pin <span style={{color:'red'}}>*</span></label>
            <input type="number" placeholder="Enter Your 6 Digit E Pin" value={formData.E_pin} onChange={update('E_pin')} required />

            <button type="submit" className="auth-btn">Create Account</button>
            {message && <p style={{color:'green', textAlign:'center', marginTop:'12px', fontWeight:'bold'}}>{message}</p>}
            {error && <p style={{color:'red', textAlign:'center', marginTop:'12px', fontWeight:'bold'}}>{error}</p>}
          </form>
          <p className="signup-link">Already have an account? <Link to="/login">Login</Link></p>
        </div>
        <div className="auth-right">
          <img src="/logo.jpeg" alt="SET Logo" />
        </div>
      </div>
    </div>
  );
};
export default SignUp;
