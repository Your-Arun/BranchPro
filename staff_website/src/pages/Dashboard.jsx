import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, Download, Clock, AlertCircle, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

const Dashboard = () => {
  const { dashboard, dispatches, user, updateStatus, toast } = useAuth();
  const navigate = useNavigate();

  const metrics = dashboard?.metrics;
  const recentActivity = dashboard?.recentActivity || [];

  const unconfirmedIncoming = useMemo(() => {
    if (!user || user.role === "ADMIN") return [];
    const branchIdStr = String(user.branch?._id || user.branchId);
    return (dispatches || []).filter(d => 
      String(d.toBranchId) === branchIdStr && 
      (d.status !== "RECEIVED" && d.status !== "FAILED" && d.status !== "COMPLETED")
    );
  }, [dispatches, user]);

  return (
    <div>
      <h1 className="title">Branch Overview</h1>
      <p className="subtitle" style={{ marginBottom: '32px' }}>Welcome back, {user?.fullName}</p>
      
      {unconfirmedIncoming.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Pending Deliveries</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {unconfirmedIncoming.map(item => (
              <div 
                key={item._id} 
                className="card" 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-soft)', borderColor: 'var(--warning)', cursor: 'pointer' }}
                onClick={() => navigate('/details/' + (item._id || item.id))}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '24px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock color="var(--warning)" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>#{item.trackingId}</h3>
                    <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '14px' }}>From {item.fromBranch} • {timeAgo(item.createdAt)}</p>
                  </div>
                </div>
                <button 
                  style={{ backgroundColor: 'var(--warning)', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', zIndex: 2 }}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    updateStatus(item._id, "RECEIVED").catch(err => {
                      toast(err.response?.data?.message || err.message || "Failed to confirm", "error");
                    });
                  }}
                >
                  Confirm Receipt
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div className="metric-card" style={{ borderBottomColor: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate('/incoming')}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ padding: '8px', borderRadius: '12px', backgroundColor: 'rgba(78, 141, 255, 0.1)' }}>
              <Send color="var(--primary)" size={24} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '16px' }}>{metrics?.totalSent?.value || 0}</div>
          <div style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>Sent</div>
        </div>
        
        <div className="metric-card" style={{ borderBottomColor: 'var(--success)', cursor: 'pointer' }} onClick={() => navigate('/incoming')}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ padding: '8px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <Download color="var(--success)" size={24} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '16px' }}>{metrics?.received?.value || 0}</div>
          <div style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>Received</div>
        </div>
        
        <div className="metric-card" style={{ borderBottomColor: 'var(--warning)', cursor: 'pointer' }} onClick={() => navigate('/incoming')}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ padding: '8px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
              <Clock color="var(--warning)" size={24} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '16px' }}>{metrics?.pending?.value || 0}</div>
          <div style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>In Transit</div>
        </div>
        
        <div className="metric-card" style={{ borderBottomColor: 'var(--danger)', cursor: 'pointer' }} onClick={() => navigate('/incoming')}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ padding: '8px', borderRadius: '12px', backgroundColor: 'rgba(255, 71, 87, 0.1)' }}>
              <AlertCircle color="var(--danger)" size={24} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '16px' }}>{metrics?.overdue?.value || 0}</div>
          <div style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>Overdue</div>
        </div>
      </div>

      <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Recent Transits</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {recentActivity.map(item => (
          <div 
            key={item.id} 
            className="card" 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s', padding: '16px 24px' }}
            onClick={() => navigate('/details/' + (item.id || item._id))}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '24px', backgroundColor: 'rgba(78, 141, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>#{item.trackingId}</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '14px' }}>{item.branchName} • {timeAgo(item.createdAt)}</p>
              </div>
            </div>
            <div style={{ padding: '6px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold', 
              backgroundColor: item.status === 'RECEIVED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(78, 141, 255, 0.15)',
              color: item.status === 'RECEIVED' ? 'var(--success)' : 'var(--primary)'
            }}>
              {item.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
