import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, ArrowLeft, Send, Download, Tag, Info, CheckCircle, Clock, XCircle, Edit } from 'lucide-react';

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString();
};

const getStatusColor = (status) => {
  switch (status) {
    case 'RECEIVED': case 'COMPLETED': return 'var(--success)';
    case 'FAILED': return 'var(--danger)';
    case 'IN_TRANSIT': case 'TRANSIT': return 'var(--warning)';
    default: return 'var(--primary)';
  }
};

const DispatchDetails = () => {
  const { id } = useParams();
  const { api, updateStatus, user, toast, confirm } = useAuth();
  const navigate = useNavigate();
  
  const [dispatchData, setDispatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data } = await api.get(`/dispatches/${id}`);
        setDispatchData(data);
      } catch (err) {
        setError('Failed to load details. It may have been deleted.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, api]);

  if (loading) return <div style={{ padding: '32px' }}>Loading...</div>;
  if (error) return <div style={{ padding: '32px', color: 'var(--danger)' }}>{error}</div>;
  if (!dispatchData) return null;

  const branchId = user?.branchId || user?.branch?._id;
  const isIncoming = String(dispatchData.toBranchId?._id || dispatchData.toBranchId) === String(branchId);
  const needsConfirm = isIncoming && dispatchData.status !== 'RECEIVED' && dispatchData.status !== 'FAILED';

  const handleConfirm = async () => {
    confirm("Confirm Receipt", "Confirm receipt of this package?", async () => {
      try {
        const updated = await updateStatus(id, "RECEIVED");
        setDispatchData(updated);
        toast("Package marked as received", "success");
      } catch (err) {
        toast(err.response?.data?.message || err.message || "Action failed", "error");
      }
    });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', backgroundColor: 'transparent', marginBottom: '24px', fontSize: '16px' }}
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="details-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 className="title" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '28px' }}>
            <Package size={28} color="var(--primary)" />
            #{dispatchData.trackingId}
          </h1>
          <p className="subtitle" style={{ marginTop: '4px' }}>Created on {formatTime(dispatchData.createdAt)}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={() => navigate(`/dispatch/edit/${id}`)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 16px', 
              backgroundColor: 'var(--bg-soft)', 
              border: '1px solid var(--border)', 
              borderRadius: '12px', 
              color: 'var(--text)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <Edit size={16} /> Edit
          </button>
          <div style={{ 
            padding: '8px 20px', 
            borderRadius: '100px', 
            backgroundColor: `${getStatusColor(dispatchData.status)}22`, 
            color: getStatusColor(dispatchData.status),
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            {dispatchData.status}
          </div>
        </div>
      </div>

      <div className="branch-cards-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={16} /> SENDER BRANCH
          </h3>
          <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{dispatchData.fromBranchId?.name || dispatchData.fromBranch}</p>
          <p style={{ color: 'var(--muted)', margin: 0 }}>Code: {dispatchData.fromBranchId?.code || dispatchData.fromBranchCode || 'N/A'}</p>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} /> DESTINATION BRANCH
          </h3>
          <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{dispatchData.toBranchId?.name || dispatchData.toBranch}</p>
          <p style={{ color: 'var(--muted)', margin: 0 }}>Code: {dispatchData.toBranchId?.code || dispatchData.toBranchCode || 'N/A'}</p>
        </div>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Shipment Details</h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
          <div>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '4px', fontWeight: 'bold' }}>COURIER</p>
            <p style={{ fontSize: '16px', margin: 0, fontWeight: '500' }}>{dispatchData.courierName}</p>
          </div>
          <div>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '4px', fontWeight: 'bold' }}>CATEGORY</p>
            <p style={{ fontSize: '16px', margin: 0, fontWeight: '500' }}>{dispatchData.category}</p>
          </div>
          <div>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '4px', fontWeight: 'bold' }}>TRACKING NO. (MANUAL)</p>
            <p style={{ fontSize: '16px', margin: 0, fontWeight: '500' }}>{dispatchData.docketNumber || dispatchData.docketNo || dispatchData.docket_no || 'N/A'}</p>
          </div>
          <div>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '4px', fontWeight: 'bold' }}>DISPATCH DATE</p>
            <p style={{ fontSize: '16px', margin: 0, fontWeight: '500' }}>{dispatchData.dispatchDate ? new Date(dispatchData.dispatchDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</p>
          </div>
        </div>

        {dispatchData.description && (
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--bg-soft)', borderRadius: '12px' }}>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '8px', fontWeight: 'bold' }}>NOTES</p>
            <p style={{ fontSize: '15px', margin: 0, lineHeight: '1.5' }}>{dispatchData.description}</p>
          </div>
        )}
      </div>

      {needsConfirm && (
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
          <button className="btn-primary" onClick={handleConfirm} style={{ width: 'auto', padding: '14px 40px', backgroundColor: 'var(--success)' }}>
            <CheckCircle size={20} /> Mark as Received
          </button>
        </div>
      )}

      {/* TIMELINE */}
      <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Movement Timeline</h2>
      <div className="card" style={{ padding: '32px 24px' }}>
        {dispatchData.timeline?.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No timeline events recorded.</p>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Vertical Line */}
            <div style={{ position: 'absolute', left: '15px', top: '10px', bottom: '10px', width: '2px', backgroundColor: 'var(--border)' }}></div>
            
            {(dispatchData.timeline || []).map((step, index) => {
              const isLast = index === dispatchData.timeline.length - 1;
              const isCompleted = step.status === 'COMPLETED';
              const isFailed = step.status === 'FAILED';
              const isPending = step.status === 'PENDING' || step.status === 'IN_TRANSIT';
              const isOverdue = step.status === 'OVERDUE';
              
              let dotColor = 'var(--bg-soft)';
              let dotBorder = 'var(--muted)';
              
              if (isCompleted) { dotColor = 'var(--success)'; dotBorder = 'var(--success)'; }
              else if (isFailed) { dotColor = 'var(--danger)'; dotBorder = 'var(--danger)'; }
              else if (isPending) { dotColor = 'var(--warning)'; dotBorder = 'var(--warning)'; }
              else if (isOverdue) { dotColor = 'var(--danger)'; dotBorder = 'var(--danger)'; }

              const isReceiverName = step.note?.includes('verified by');
              const verifierNameMatch = isReceiverName ? step.note.match(/verified by (.+) at destination/) : null;
              const verifierName = verifierNameMatch ? verifierNameMatch[1] : null;

              return (
                <div key={step._id || index} style={{ display: 'flex', gap: '20px', marginBottom: isLast ? 0 : '32px', position: 'relative' }}>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '16px', backgroundColor: dotColor, border: `3px solid ${dotBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isCompleted && <CheckCircle size={14} color="#fff" />}
                      {isFailed && <XCircle size={14} color="#fff" />}
                      {isPending && <Clock size={14} color="#fff" />}
                    </div>
                  </div>
                  <div style={{ flex: 1, paddingTop: '4px' }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', color: isCompleted ? 'var(--success)' : isFailed ? 'var(--danger)' : isPending ? 'var(--warning)' : isOverdue ? 'var(--danger)' : 'var(--text)' }}>
                      {step.title}
                    </h4>
                    
                    {isReceiverName ? (
                      <p style={{ margin: '0 0 8px 0', fontSize: '15px', color: 'var(--muted)' }}>
                        Delivery verified by <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{verifierName}</span> at destination.
                      </p>
                    ) : (
                      <p style={{ margin: '0 0 8px 0', fontSize: '15px', color: 'var(--muted)' }}>{step.note}</p>
                    )}
                    
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', fontWeight: 'bold' }}>{formatTime(step.timestamp || step.date)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DispatchDetails;
