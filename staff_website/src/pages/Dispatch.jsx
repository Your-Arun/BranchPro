import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

const Dispatch = () => {
  const { createDispatch, updateDispatch, branches, user, toast, api } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    toBranchId: '',
    category: '',
    courierName: '',
    docketNumber: '',
    description: '',
    dispatchDate: new Date()
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const destBranches = branches.filter(
    b => b._id !== user?.branch?._id && b._id !== user?.branchId
  );

  // Fetch dispatch data if in edit mode
  useEffect(() => {
    if (id) {
      const fetchDispatch = async () => {
        try {
          const { data } = await api.get(`/dispatches/${id}`);
          setIsEditMode(true);
          setForm({
            toBranchId: data.toBranchId?._id || data.toBranchId,
            category: data.category,
            courierName: data.courierName,
            docketNumber: data.docketNumber,
            description: data.description || '',
            dispatchDate: new Date(data.dispatchDate)
          });
        } catch (err) {
          toast("Failed to load dispatch data", "error");
          navigate('/incoming');
        }
      };
      fetchDispatch();
    }
  }, [id, api, toast, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Auto-inject missing required fields
    const branchId = user?.branchId || user?.branch?._id;
    const payload = {
      ...form,
      fromBranchId: branchId,
      dispatchDate: form.dispatchDate.toISOString()
    };

    try {
      if (isEditMode && id) {
        await updateDispatch(id, payload);
        toast("Dispatch updated successfully", "success");
      } else {
        await createDispatch(payload);
        toast("Dispatch created successfully", "success");
      }
      navigate('/');
    } catch (err) {
      toast(err.response?.data?.message || err.message || "Failed to save dispatch", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="title">{isEditMode ? 'Edit Dispatch' : 'Create Dispatch'}</h1>
      <p className="subtitle" style={{ marginBottom: '32px' }}>
        {isEditMode ? 'Update package details' : 'Send a new package to a branch'}
      </p>

      <div className="card" style={{ maxWidth: '600px' }}>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div className="input-group">
            <label>Dispatch Date *</label>
            <input
              className="input-field"
              type="date"
              value={form.dispatchDate.toISOString().split('T')[0]}
              onChange={(e) => {
                const selectedDate = new Date(e.target.value);
                // Set time to start of day to avoid timezone issues
                selectedDate.setHours(0, 0, 0, 0);
                setForm({ ...form, dispatchDate: selectedDate });
              }}
              required
            />
          </div>

          <div className="input-group">
            <label>Destination Branch *</label>
            <select
              className="input-field"
              value={form.toBranchId}
              onChange={e => setForm({ ...form, toBranchId: e.target.value })}
              required
            >
              <option value="" disabled>Select Branch...</option>
              {destBranches.map(b => (
                <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Category *</label>
            <select
              className="input-field"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="" disabled>Select Category...</option>
              <option value="Doc">Document</option>
              <option value="Non-Doc">Non-Document</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div className="input-group">
            <label>Courier Service *</label>
            <input
              className="input-field"
              type="text"
              placeholder="e.g. BlueDart, DTDC"
              value={form.courierName}
              onChange={e => setForm({ ...form, courierName: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label>Docket / Tracking Number *</label>
            <input
              className="input-field"
              type="text"
              placeholder="Enter docket number"
              value={form.docketNumber}
              onChange={e => setForm({ ...form, docketNumber: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label>Description / Notes</label>
            <textarea
              className="input-field"
              rows="4"
              placeholder="Optional"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            ></textarea>
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '16px' }}>
            {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Dispatch' : 'Create Dispatch')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dispatch;
