import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, Save, Plus, Trash2, Edit, Eye } from 'lucide-react';

const GeneralEntry = () => {
  const { api, user, toast, confirm } = useAuth();
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Form state
  const [form, setForm] = useState({
    itemName: '',
    quantity: '',
    description: '',
    entryType: 'IN', // IN or OUT
    category: 'GENERAL'
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/general-entries');
      setEntries(data);
    } catch (err) {
      toast("Failed to load entries", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.itemName.trim() || !form.quantity) {
      toast("Please fill in required fields", "error");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/general-entries/${editingId}`, form);
        toast("Entry updated successfully", "success");
        setEditingId(null);
      } else {
        await api.post('/general-entries', form);
        toast("Entry added successfully", "success");
      }
      
      setForm({
        itemName: '',
        quantity: '',
        description: '',
        entryType: 'IN',
        category: 'GENERAL'
      });
      setIsFormVisible(false);
      fetchEntries();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to save entry", "error");
    }
  };

  const handleEdit = (entry) => {
    setForm({
      itemName: entry.itemName,
      quantity: entry.quantity,
      description: entry.description || '',
      entryType: entry.entryType,
      category: entry.category || 'GENERAL'
    });
    setEditingId(entry._id);
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    confirm("Delete Entry", "Are you sure you want to delete this entry?", async () => {
      try {
        await api.delete(`/general-entries/${id}`);
        toast("Entry deleted successfully", "success");
        fetchEntries();
      } catch (err) {
        toast(err.response?.data?.message || "Failed to delete entry", "error");
      }
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <button 
            onClick={() => navigate(-1)} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', backgroundColor: 'transparent', marginBottom: '8px', fontSize: '16px' }}
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="title" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '28px' }}>
            <Package size={28} color="var(--primary)" />
            General Entry Management
          </h1>
          <p className="subtitle">Track incoming and outgoing items at your branch</p>
        </div>
        
        <button 
          onClick={() => {
            setEditingId(null);
            setForm({
              itemName: '',
              quantity: '',
              description: '',
              entryType: 'IN',
              category: 'GENERAL'
            });
            setIsFormVisible(!isFormVisible);
          }}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '12px 24px', 
            backgroundColor: 'var(--primary)', 
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          <Plus size={20} /> {isFormVisible ? 'Hide Form' : 'Add New Entry'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {isFormVisible && (
        <div className="card" style={{ marginBottom: '32px', padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            {editingId ? 'Edit Entry' : 'Add New Entry'}
          </h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="input-group">
              <label>Item Name *</label>
              <input
                className="input-field"
                type="text"
                placeholder="e.g. Office supplies, Documents, Equipment"
                value={form.itemName}
                onChange={(e) => setForm({...form, itemName: e.target.value})}
                required
              />
            </div>

            <div className="input-group">
              <label>Quantity *</label>
              <input
                className="input-field"
                type="number"
                min="1"
                placeholder="Enter quantity"
                value={form.quantity}
                onChange={(e) => setForm({...form, quantity: e.target.value})}
                required
              />
            </div>

            <div className="input-group">
              <label>Entry Type *</label>
              <select
                className="input-field"
                value={form.entryType}
                onChange={(e) => setForm({...form, entryType: e.target.value})}
                required
              >
                <option value="IN">Incoming (Items Received)</option>
                <option value="OUT">Outgoing (Items Sent)</option>
              </select>
            </div>

            <div className="input-group">
              <label>Category</label>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
              >
                <option value="GENERAL">General Items</option>
                <option value="OFFICE_SUPPLIES">Office Supplies</option>
                <option value="EQUIPMENT">Equipment</option>
                <option value="DOCUMENTS">Documents</option>
                <option value="POSTAL">Postal Items</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Description</label>
              <textarea
                className="input-field"
                rows="3"
                placeholder="Optional details about the item"
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
              ></textarea>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                type="button"
                onClick={() => {
                  setIsFormVisible(false);
                  setEditingId(null);
                  setForm({
                    itemName: '',
                    quantity: '',
                    description: '',
                    entryType: 'IN',
                    category: 'GENERAL'
                  });
                }}
                style={{ 
                  padding: '12px 24px', 
                  backgroundColor: 'var(--bg-soft)', 
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                style={{ 
                  padding: '12px 24px', 
                  backgroundColor: 'var(--primary)', 
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                <Save size={20} style={{ marginRight: '8px' }} />
                {editingId ? 'Update Entry' : 'Add Entry'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Entries List */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
          Entry History
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
            Loading entries...
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
            No entries found. Add your first entry above.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {entries.map((entry) => (
              <div key={entry._id} style={{ 
                display: 'grid', 
                gridTemplateColumns: 'auto 1fr auto auto auto', 
                gap: '16px', 
                alignItems: 'center',
                padding: '16px',
                backgroundColor: 'var(--bg-soft)',
                borderRadius: '12px',
                border: '1px solid var(--border)'
              }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  backgroundColor: entry.entryType === 'IN' ? 'var(--success)' : 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  {entry.entryType === 'IN' ? 'IN' : 'OUT'}
                </div>
                
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold' }}>{entry.itemName}</h4>
                  <p style={{ margin: '0 0 4px 0', color: 'var(--muted)', fontSize: '14px' }}>
                    Quantity: {entry.quantity} | Category: {entry.category}
                  </p>
                  {entry.description && (
                    <p style={{ margin: 0, color: 'var(--text)', fontSize: '14px' }}>{entry.description}</p>
                  )}
                  <p style={{ margin: '8px 0 0 0', color: 'var(--muted)', fontSize: '12px' }}>
                    Added: {formatTime(entry.createdAt)} | By: {entry.branchId?.name || 'Unknown Branch'}
                  </p>
                </div>

                <div style={{ 
                  padding: '6px 12px', 
                  borderRadius: '20px', 
                  backgroundColor: entry.entryType === 'IN' ? 'var(--success)' : 'var(--danger)',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {entry.entryType === 'IN' ? 'RECEIVED' : 'SENT'}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEdit(entry)}
                    style={{ 
                      padding: '8px 12px', 
                      backgroundColor: 'var(--bg-soft)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text)',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(entry._id)}
                    style={{ 
                      padding: '8px 12px', 
                      backgroundColor: 'var(--bg-soft)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text)',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralEntry;