import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Package, ArrowLeft, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
  const { forgotPassword, resetPassword, toast } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & Reset

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setStep(2);
      toast("OTP sent to your email", "success");
    } catch (err) {
      toast(err.response?.data?.message || err.message || 'Failed to send OTP', "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast("Passwords do not match", "error");
    }
    if (password.length < 6) {
      return toast("Password must be at least 6 characters", "error");
    }

    setLoading(true);
    try {
      await resetPassword(email, otp, password);
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
        <button 
          onClick={() => step === 2 ? setStep(1) : navigate('/login')} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', backgroundColor: 'transparent', marginBottom: '24px', fontSize: '14px', cursor: 'pointer', border: 'none', padding: 0 }}
        >
          <ArrowLeft size={16} /> {step === 2 ? 'Back' : 'Back to Login'}
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '32px', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {step === 1 ? <Package size={32} color="#fff" /> : <KeyRound size={32} color="#fff" />}
          </div>
        </div>
        
        <h2 className="title" style={{ textAlign: 'center', fontSize: '24px' }}>
          {step === 1 ? 'Forgot Password' : 'Reset Password'}
        </h2>
        <p className="subtitle" style={{ textAlign: 'center', marginBottom: '32px' }}>
          {step === 1 ? "Enter your email and we'll send you a 6-digit OTP to reset your password." : `Enter the 6-digit OTP sent to ${email} and your new password.`}
        </p>
        
        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <input 
              className="input-field" 
              type="email" 
              placeholder="Your Email Address" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <input 
              className="input-field" 
              type="text" 
              placeholder="6-Digit OTP" 
              value={otp} 
              onChange={e => setOtp(e.target.value)} 
              maxLength="6"
              style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}
              required 
            />
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
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
