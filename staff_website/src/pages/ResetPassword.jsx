import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Package } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const { resetPassword, toast } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast("Passwords do not match", "error");
    }
    if (password.length < 6) {
      return toast("Password must be at least 6 characters", "error");
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      toast("Password reset successful. Please login.", "success");
      navigate('/login');
    } catch (err) {
      toast(err.response?.data?.message || err.message || 'Failed to reset password', "error");
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
        
        <h2 className="title" style={{ textAlign: 'center', fontSize: '24px' }}>Reset Password</h2>
        <p className="subtitle" style={{ textAlign: 'center', marginBottom: '32px' }}>
          Please enter your new password below.
        </p>
        
        <form onSubmit={handleSubmit}>
          <input 
            className="input-field" 
            type="password" 
            placeholder="New Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
          <input 
            className="input-field" 
            type="password" 
            placeholder="Confirm New Password" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            required 
          />
          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '16px' }}>
            {loading ? 'Resetting...' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
