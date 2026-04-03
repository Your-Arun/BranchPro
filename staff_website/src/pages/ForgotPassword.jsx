import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Package, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const { forgotPassword, toast } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
      toast("Password reset link sent to your email", "success");
    } catch (err) {
      toast(err.response?.data?.message || err.message || 'Failed to send reset link', "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '400px' }}>
        <button 
          onClick={() => navigate('/login')} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', backgroundColor: 'transparent', marginBottom: '24px', fontSize: '14px', cursor: 'pointer', border: 'none', padding: 0 }}
        >
          <ArrowLeft size={16} /> Back to Login
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '32px', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={32} color="#fff" />
          </div>
        </div>
        
        <h2 className="title" style={{ textAlign: 'center', fontSize: '24px' }}>Forgot Password</h2>
        <p className="subtitle" style={{ textAlign: 'center', marginBottom: '32px' }}>
          Enter your email and we'll send you a link to reset your password.
        </p>
        
        {success ? (
          <div style={{ textAlign: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '20px', borderRadius: '12px', border: '1px solid var(--success)' }}>
            <p style={{ color: 'var(--success)', fontWeight: 'bold', margin: '0 0 16px 0' }}>Link Sent Successfully!</p>
            <p style={{ color: 'var(--text)', fontSize: '14px', margin: 0 }}>Please check your inbox and spam folder for the password reset link.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input 
              className="input-field" 
              type="email" 
              placeholder="Your Email Address" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
