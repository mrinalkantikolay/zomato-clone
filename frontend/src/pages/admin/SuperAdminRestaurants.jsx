import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import superadminAPI from '../../api/superadmin.api';

const SuperAdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const [expandedId, setExpandedId] = useState(null);

  const [form, setForm] = useState({
    name: '', address: '', cuisine: '', description: '', imageUrl: '',
    ownerName: '', ownerEmail: '',
  });

  const fetchRestaurants = async () => {
    try {
      const { data } = await superadminAPI.getAllRestaurants();
      setRestaurants(data.data || []);
    } catch (err) {
      toast.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRestaurants(); }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.ownerName || !form.ownerEmail) {
      toast.error('All fields marked * are required');
      return;
    }
    setSaving(true);
    try {
      const { data } = await superadminAPI.createRestaurantWithOwner({
        restaurant: {
          name: form.name,
          address: form.address,
          cuisine: form.cuisine,
          description: form.description,
          imageUrl: form.imageUrl,
        },
        ownerName: form.ownerName,
        ownerEmail: form.ownerEmail,
      });
      toast.success('Restaurant & owner created!');

      // Show generated credentials
      if (data.data?.owner?.isNewAccount && data.data.owner.generatedPassword) {
        setCreatedCredentials({
          email: data.data.owner.email,
          password: data.data.owner.generatedPassword,
          restaurantName: data.data.restaurant.name,
        });
      } else {
        setCreatedCredentials({
          email: data.data.owner.email,
          password: '(existing account — uses their current password)',
          restaurantName: data.data.restaurant.name,
        });
      }

      setForm({ name: '', address: '', cuisine: '', description: '', imageUrl: '', ownerName: '', ownerEmail: '' });
      setShowModal(false);
      fetchRestaurants();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Creation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This will also delete all menu items.`)) return;
    setDeleting(id);
    try {
      await superadminAPI.deleteRestaurant(id);
      toast.success('Restaurant deleted');
      fetchRestaurants();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
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
        <h1 style={{ color: '#fafafa', fontSize: '24px', fontWeight: 700, margin: 0 }}>All Restaurants</h1>
        <button
          onClick={() => { setShowModal(true); setCreatedCredentials(null); }}
          style={{
            background: 'linear-gradient(135deg, #e23744, #ff6b6b)',
            color: '#fff', border: 'none', padding: '10px 20px',
            borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
          }}
        >
          + Create Restaurant
        </button>
      </div>

      {/* Credentials popup */}
      {createdCredentials && (
        <div style={{
          background: 'linear-gradient(135deg, #1a2e1a, #141414)',
          border: '1px solid #22c55e40',
          borderRadius: '14px', padding: '20px', marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
                ✅ Owner Account Created — Share These Credentials
              </div>
              <div style={{ color: '#fafafa', fontSize: '14px', marginBottom: '4px' }}>
                <strong>Restaurant:</strong> {createdCredentials.restaurantName}
              </div>
              <div style={{ color: '#fafafa', fontSize: '14px', marginBottom: '4px' }}>
                <strong>Email:</strong> {createdCredentials.email}
              </div>
              <div style={{ color: '#fafafa', fontSize: '14px' }}>
                <strong>Password:</strong>{' '}
                <span style={{ background: '#262626', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                  {createdCredentials.password}
                </span>
              </div>
            </div>
            <button
              onClick={() => setCreatedCredentials(null)}
              style={{ background: 'none', border: 'none', color: '#737373', cursor: 'pointer', fontSize: '18px' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Restaurant list */}
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
          <div style={{ color: '#fafafa', fontSize: '18px', fontWeight: 600 }}>No restaurants yet</div>
          <div style={{ color: '#737373', fontSize: '14px', marginTop: '8px' }}>Click "Create Restaurant" to add one</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {restaurants.map((r) => (
            <div key={r.id} style={{
              background: '#141414', border: expandedId === r.id ? '1px solid #3b82f650' : '1px solid #262626',
              borderRadius: '14px', overflow: 'hidden',
              transition: 'border-color .2s',
            }}>
              {/* Main row */}
              <div
                onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                style={{
                  padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: '16px',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={r.imageUrl || 'https://via.placeholder.com/60'}
                  alt={r.name}
                  style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fafafa', fontSize: '16px', fontWeight: 600 }}>{r.name}</div>
                  <div style={{ color: '#737373', fontSize: '13px', marginTop: '2px' }}>{r.address}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
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
                    {r.owner && (
                      <span style={{ background: '#1e3a5f', color: '#60a5fa', padding: '2px 8px', borderRadius: '6px', fontSize: '11px' }}>
                        👤 {r.owner.name} ({r.owner.email})
                      </span>
                    )}
                  </div>
                </div>
                <span style={{
                  color: '#737373', fontSize: '18px',
                  transform: expandedId === r.id ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform .2s',
                }}>
                  ▼
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(r.id, r.name); }}
                  disabled={deleting === r.id}
                  style={{
                    background: 'rgba(239,68,68,.15)', color: '#ef4444', border: 'none',
                    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                    opacity: deleting === r.id ? 0.5 : 1, whiteSpace: 'nowrap',
                  }}
                >
                  {deleting === r.id ? '...' : '🗑️ Delete'}
                </button>
              </div>

              {/* Expanded stats panel */}
              {expandedId === r.id && (
                <div style={{
                  borderTop: '1px solid #262626',
                  padding: '16px 20px',
                  display: 'flex', gap: '24px', flexWrap: 'wrap',
                  background: 'linear-gradient(135deg, #0f1a2e, #141414)',
                }}>
                  <div style={{ flex: '1 1 140px' }}>
                    <div style={{ color: '#737373', fontSize: '12px', marginBottom: '4px' }}>Total Orders</div>
                    <div style={{ color: '#fafafa', fontSize: '28px', fontWeight: 700 }}>
                      {(r.totalOrders || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div style={{ flex: '1 1 140px' }}>
                    <div style={{ color: '#737373', fontSize: '12px', marginBottom: '4px' }}>Total Revenue</div>
                    <div style={{ color: '#22c55e', fontSize: '28px', fontWeight: 700 }}>
                      ₹{(r.totalRevenue || 0).toLocaleString('en-IN')}
                    </div>
                    <div style={{ color: '#525252', fontSize: '11px', marginTop: '2px' }}>From delivered orders</div>
                  </div>
                  <div style={{ flex: '1 1 140px' }}>
                    <div style={{ color: '#737373', fontSize: '12px', marginBottom: '4px' }}>Platform Commission (20%)</div>
                    <div style={{ color: '#f59e0b', fontSize: '28px', fontWeight: 700 }}>
                      ₹{Math.round((r.totalRevenue || 0) * 0.2).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div style={{ flex: '1 1 140px' }}>
                    <div style={{ color: '#737373', fontSize: '12px', marginBottom: '4px' }}>Net to Owner (80%)</div>
                    <div style={{ color: '#3b82f6', fontSize: '28px', fontWeight: 700 }}>
                      ₹{Math.round((r.totalRevenue || 0) * 0.8).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal — rendered via Portal to escape scroll container */}
      {showModal && createPortal(
        <div
          onClick={() => setShowModal(false)}
          onWheel={(e) => e.stopPropagation()}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            zIndex: 9999, padding: '40px 24px',
            overflowY: 'auto',
          }}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            style={{
              background: '#141414', border: '1px solid #262626',
              borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '520px',
              flexShrink: 0,
            }}
          >
            <h2 style={{ color: '#fafafa', fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>
              Create Restaurant + Owner
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Restaurant section */}
              <div style={{ color: '#e23744', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Restaurant Details
              </div>
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
                  style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description"
                />
              </div>
              <div>
                <label style={labelStyle}>Image URL</label>
                <input style={inputStyle} value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
              </div>

              {/* Owner section */}
              <div style={{ color: '#3b82f6', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '8px' }}>
                Owner Account
              </div>
              <div style={{ color: '#737373', fontSize: '12px', marginTop: '-8px' }}>
                A login account will be auto-created for this owner
              </div>
              <div>
                <label style={labelStyle}>Owner Name *</label>
                <input style={inputStyle} value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} placeholder="John Doe" />
              </div>
              <div>
                <label style={labelStyle}>Owner Email *</label>
                <input style={inputStyle} type="email" value={form.ownerEmail} onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })} placeholder="owner@email.com" />
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
                {saving ? 'Creating...' : 'Create Restaurant & Owner'}
              </button>
            </div>
          </form>
        </div>,
        document.body
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

export default SuperAdminRestaurants;
