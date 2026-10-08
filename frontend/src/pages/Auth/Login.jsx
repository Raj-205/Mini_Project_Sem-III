import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPath';
import './auth.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [ePin, setEPin] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post(API_PATHS.AUTH_LOGIN, { username, password, ePin });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
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
          <h1>Welcome to SET</h1>
          <form className="login-form" onSubmit={handleSubmit}>
            <label>Username <span style={{color:'red'}}>*</span></label>
            <input type="text" placeholder="Enter Your Username" value={username} onChange={e => setUsername(e.target.value)} required />

            <label>Password <span style={{color:'red'}}>*</span></label>
            <input type="password" placeholder="Enter Your Password" value={password} onChange={e => setPassword(e.target.value)} required />

            <div className="divider"><span>Or</span></div>

            <label>E PIN</label>
            <input type="number" placeholder="Enter Your 6 Digit E PIN" value={ePin} onChange={e => setEPin(e.target.value)} />

            <div className="forgot">
              <Link to="/resetpassword">Forgot Password / E PIN?</Link>
            </div>

            <button type="submit" className="auth-btn">Sign In</button>
            {message && <p style={{color:'red', textAlign:'center', marginTop:'10px'}}>{message}</p>}
          </form>
          <p className="signup-link">Don't have an account? <Link to="/signup">Sign up</Link></p>
        </div>
        <div className="auth-right">
          <img src="/logo.jpeg" alt="SET Logo" />
        </div>
      </div>
    </div>
  );
};
export default Login;
