import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Download, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Incoming = () => {
  const { dispatches, user, updateStatus, toast, confirm } = useAuth();
  const [tab, setTab] = useState('ALL'); // ALL, SENT, PENDING, RECEIVED
  const navigate = useNavigate();

  const branchId = user?.branchId || user?.branch?._id;

  const filtered = dispatches.filter(d => {
    if (tab === 'SENT') return String(d.fromBranchId) === String(branchId);
    if (tab === 'PENDING') return String(d.toBranchId) === String(branchId) && d.status !== 'RECEIVED' && d.status !== 'FAILED';
    if (tab === 'RECEIVED') return String(d.toBranchId) === String(branchId) && d.status === 'RECEIVED';
    return true; // ALL
  });

  return (
    <div>
      <h1 className="title">Dispatches</h1>
      <p className="subtitle" style={{ marginBottom: '32px' }}>Manage all inbound and outbound shipments</p>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', backgroundColor: 'var(--card)', padding: '6px', borderRadius: '16px', width: 'fit-content' }}>
        {['ALL', 'SENT', 'PENDING', 'RECEIVED'].map(t => (
          <button 
            key={t}
            onClick={() => setTab(t)}
            style={{ 
              padding: '10px 24px', 
              borderRadius: '12px', 
              backgroundColor: tab === t ? 'rgba(78, 141, 255, 0.15)' : 'transparent',
              color: tab === t ? 'var(--primary)' : 'var(--muted)',
              fontWeight: tab === t ? 'bold' : 'normal',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.length === 0 ? <p style={{ color: 'var(--muted)' }}>No records found</p> : filtered.map(item => {
          const isIncoming = String(item.toBranchId) === String(branchId);
          const needsConfirm = isIncoming && item.status !== 'RECEIVED' && item.status !== 'FAILED';
          
          return (
            <div 
              key={item._id} 
              className="card" 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => navigate('/details/' + (item._id || item.id))}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>#{item.trackingId}</h3>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-soft)', color: 'var(--text)' }}>
                    {item.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '24px', color: 'var(--muted)', fontSize: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Send size={16} /> From: {item.fromBranch}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Download size={16} /> To: {item.toBranch}
                  </div>
                  <div>Category: {item.category}</div>
                </div>
              </div>
              
              {needsConfirm && (
                <button 
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '10px 24px', backgroundColor: 'var(--success)', zIndex: 2 }}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    updateStatus(item._id, "RECEIVED").catch(err => {
                      toast(err.response?.data?.message || err.message || "Failed to confirm", "error");
                    });
                  }}
                >
                  <CheckCircle size={18} /> Confirm Receipt
                </button>
              )}
              
              {!isIncoming && item.status !== 'FAILED' && item.status !== 'RECEIVED' && (
                <button 
                  style={{ backgroundColor: 'transparent', color: 'var(--danger)', padding: '10px 24px', borderRadius: '12px', border: '1px solid var(--danger)', cursor: 'pointer', fontWeight: 'bold', zIndex: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    confirm("Withdraw Shipment", "Are you sure you want to withdraw this shipment?", async () => {
                      try {
                        await updateStatus(item._id, "FAILED");
                        toast("Shipment withdrawn successfully", "success");
                      } catch (err) {
                        toast(err.response?.data?.message || err.message || "Failed to withdraw", "error");
                      }
                    });
                  }}
                >
                  Withdraw
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Incoming;
