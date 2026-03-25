import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dispatch = () => {
  const { createDispatch, branches, user, toast } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    toBranchId: '',
    category: '',
    courierName: '',
    docketNumber: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const destBranches = branches.filter(
    b => b._id !== user?.branch?._id && b._id !== user?.branchId
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Auto-inject missing required fields
    const branchId = user?.branchId || user?.branch?._id;
    const payload = {
      ...form,
      fromBranchId: branchId,
      dispatchDate: new Date().toISOString()
    };

    try {
      await createDispatch(payload);
      toast("Dispatch created successfully", "success");
      navigate('/');
    } catch (err) {
      toast(err.response?.data?.message || err.message || "Failed to create dispatch", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="title">Create Dispatch</h1>
      <p className="subtitle" style={{ marginBottom: '32px' }}>Send a new package to a branch</p>

      <div className="card" style={{ maxWidth: '600px' }}>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Destination Branch *</label>
            <select 
              className="input-field" 
              value={form.toBranchId} 
              onChange={e => setForm({...form, toBranchId: e.target.value})} 
              required
              style={{ 
                backgroundColor: 'var(--bg)', 
                border: '1px solid var(--border)', 
                borderRadius: '8px', 
                padding: '12px', 
                fontSize: '16px',
                color: 'var(--text)',
                cursor: 'pointer'
              }}
            >
              <option value="" disabled>Select Branch...</option>
              {destBranches.map(b => (
                <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Category *</label>
            <select 
              className="input-field" 
              value={form.category} 
              onChange={e => setForm({...form, category: e.target.value})} 
              required
              style={{ 
                backgroundColor: 'var(--bg)', 
                border: '1px solid var(--border)', 
                borderRadius: '8px', 
                padding: '12px', 
                fontSize: '16px',
                color: 'var(--text)',
                cursor: 'pointer'
              }}
            >
              <option value="" disabled>Select Category...</option>
              <option value="Doc">Document</option>
              <option value="Non-Doc">Non-Document</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Courier Service *</label>
            <input 
              className="input-field" 
              type="text" 
              placeholder="e.g. BlueDart, DTDC" 
              value={form.courierName} 
              onChange={e => setForm({...form, courierName: e.target.value})} 
              required 
              style={{ 
                backgroundColor: 'var(--bg)', 
                border: '1px solid var(--border)', 
                borderRadius: '8px', 
                padding: '12px', 
                fontSize: '16px',
                color: 'var(--text)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Docket / Tracking Number</label>
            <input 
              className="input-field" 
              type="text" 
              placeholder="Optional" 
              value={form.docketNumber} 
              onChange={e => setForm({...form, docketNumber: e.target.value})} 
              style={{ 
                backgroundColor: 'var(--bg)', 
                border: '1px solid var(--border)', 
                borderRadius: '8px', 
                padding: '12px', 
                fontSize: '16px',
                color: 'var(--text)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Description / Notes</label>
            <textarea 
              className="input-field" 
              rows="4" 
              placeholder="Optional" 
              value={form.description} 
              onChange={e => setForm({...form, description: e.target.value})} 
              style={{ 
                backgroundColor: 'var(--bg)', 
                border: '1px solid var(--border)', 
                borderRadius: '8px', 
                padding: '12px', 
                fontSize: '16px',
                color: 'var(--text)'
              }}
            ></textarea>
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '16px' }}>
            {loading ? 'Creating...' : 'Create Dispatch'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dispatch;
