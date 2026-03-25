import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Package } from 'lucide-react';

const Signup = () => {
  const { signup, toast } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', registrationKey: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form);
      toast("Account created successfully!", "success");
      navigate('/');
    } catch (err) {
      toast(err.response?.data?.message || err.message || 'Signup failed', "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '400px' }}>
        <h2 className="title" style={{ textAlign: 'center' }}>Create Account</h2>
        <p className="subtitle" style={{ textAlign: 'center', marginBottom: '24px' }}>Join your branch portal</p>
        
        
        <form onSubmit={handleSubmit}>
          <input className="input-field" type="text" placeholder="Full Name" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required />
          <input className="input-field" type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <input className="input-field" type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          

          <input className="input-field" type="text" placeholder="Branch Join Code" value={form.registrationKey} onChange={e => setForm({...form, registrationKey: e.target.value})} required />

          <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Sign Up'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
