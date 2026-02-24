import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import adminAPI from '../../api/admin.api';

const ManageRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', cuisine: '', description: '', imageUrl: '', isOpen: true });
  const [saving, setSaving] = useState(false);

  const fetchRestaurants = async () => {
    try {
      const { data } = await adminAPI.getRestaurants(1, 100);
      setRestaurants(data.data || []);
    } catch (err) {
      toast.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRestaurants(); }, []);

  const openEdit = (r) => {
    setEditing(r);
    setForm({
      name: r.name || '',
      address: r.address || '',
      cuisine: r.cuisine || '',
      description: r.description || '',
      imageUrl: r.imageUrl || '',
      isOpen: r.isOpen ?? true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.address) {
      toast.error('Name and address are required');
      return;
    }
    setSaving(true);
    try {
      await adminAPI.updateRestaurant(editing.id, form);
      toast.success('Restaurant updated');
      setShowModal(false);
      fetchRestaurants();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: '#1a1a1a',
    border: '1px solid #333', borderRadius: '8px', color: '#fafafa',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = { color: '#a3a3a3', fontSize: '13px', marginBottom: '4px', display: 'block' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#fafafa', fontSize: '24px', fontWeight: 700, margin: 0 }}>My Restaurants</h1>
        <div style={{ color: '#737373', fontSize: '13px' }}>
          Contact Super Admin to add/remove restaurants
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: '80px', borderRadius: '12px', background: '#1a1a1a', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 24px',
          background: '#141414', borderRadius: '16px', border: '1px solid #262626',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏪</div>
          <div style={{ color: '#fafafa', fontSize: '18px', fontWeight: 600 }}>No restaurants assigned</div>
          <div style={{ color: '#737373', fontSize: '14px', marginTop: '8px' }}>
            Ask your Super Admin to assign restaurants to your account
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {restaurants.map((r) => (
            <div key={r.id} style={{
              background: '#141414', border: '1px solid #262626',
              borderRadius: '14px', padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <img
                src={r.imageUrl || 'https://via.placeholder.com/60'}
                alt={r.name}
                style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#fafafa', fontSize: '16px', fontWeight: 600 }}>{r.name}</div>
                <div style={{ color: '#737373', fontSize: '13px', marginTop: '2px' }}>{r.address}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  {r.cuisine && (
                    <span style={{ background: '#262626', color: '#a3a3a3', padding: '2px 8px', borderRadius: '6px', fontSize: '11px' }}>
                      {r.cuisine}
                    </span>
                  )}
                  <span style={{
                    background: r.isOpen ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)',
                    color: r.isOpen ? '#22c55e' : '#ef4444',
                    padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                  }}>
                    {r.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => openEdit(r)}
                style={{
                  background: '#262626', color: '#fafafa', border: 'none',
                  padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                }}
              >
                ✏️ Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '24px',
        }}>
          <form onSubmit={handleSubmit} style={{
            background: '#141414', border: '1px solid #262626',
            borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '500px',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <h2 style={{ color: '#fafafa', fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>
              Edit Restaurant
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Restaurant name" />
              </div>
              <div>
                <label style={labelStyle}>Address *</label>
                <input style={inputStyle} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" />
              </div>
              <div>
                <label style={labelStyle}>Cuisine</label>
                <input style={inputStyle} value={form.cuisine} onChange={(e) => setForm({ ...form, cuisine: e.target.value })} placeholder="e.g. Indian, Italian" />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description"
                />
              </div>
              <div>
                <label style={labelStyle}>Image URL</label>
                <input style={inputStyle} value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox" checked={form.isOpen}
                  onChange={(e) => setForm({ ...form, isOpen: e.target.checked })}
                  style={{ accentColor: '#e23744' }}
                />
                <label style={{ color: '#a3a3a3', fontSize: '14px' }}>Restaurant is Open</label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowModal(false)}
                style={{ background: '#262626', color: '#fafafa', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}>
                Cancel
              </button>
              <button type="submit" disabled={saving}
                style={{
                  background: 'linear-gradient(135deg, #e23744, #ff6b6b)',
                  color: '#fff', border: 'none', padding: '10px 24px',
                  borderRadius: '10px', cursor: 'pointer', fontWeight: 600,
                  fontSize: '14px', opacity: saving ? 0.6 : 1,
                }}>
                {saving ? 'Saving...' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default ManageRestaurants;
