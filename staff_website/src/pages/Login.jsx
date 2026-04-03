import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Package } from 'lucide-react';

const Login = () => {
  const { login, toast } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      toast("Welcome back!", "success");
      navigate('/');
    } catch (err) {
      toast(err.message || 'Login failed', "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '32px', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={32} color="#fff" />
          </div>
        </div>
        <h2 className="title" style={{ textAlign: 'center' }}>Welcome Back</h2>
        <p className="subtitle" style={{ textAlign: 'center', marginBottom: '32px' }}>Login to Staff Portal</p>
        
        
        <form onSubmit={handleSubmit}>
          <input className="input-field" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="input-field" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', marginTop: '-8px' }}>
            <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 'bold' }}>Forgot Password?</Link>
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--muted)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
