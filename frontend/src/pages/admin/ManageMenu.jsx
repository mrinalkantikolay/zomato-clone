import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import adminAPI from '../../api/admin.api';

const emptyItem = { name: '', price: '', category: 'Main Course', description: '', imageUrl: '', isVeg: true, isAvailable: true };

const ManageMenu = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyItem);
  const [saving, setSaving] = useState(false);

  // Fetch owner's restaurants
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await adminAPI.getRestaurants(1, 100);
        const list = data.data || [];
        setRestaurants(list);
        if (list.length > 0) setSelectedRestaurant(list[0]);
      } catch (err) {
        toast.error('Failed to load restaurants');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Fetch menu when restaurant changes
  useEffect(() => {
    if (!selectedRestaurant) return;
    const fetchMenu = async () => {
      setMenuLoading(true);
      try {
        const { data } = await adminAPI.getMenu(selectedRestaurant.id);
        setMenuItems(data.data || []);
      } catch (err) {
        toast.error('Failed to load menu');
      } finally {
        setMenuLoading(false);
      }
    };
    fetchMenu();
  }, [selectedRestaurant]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyItem);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name || '',
      price: item.price || '',
      category: item.category || 'Main Course',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      isVeg: item.isVeg ?? true,
      isAvailable: item.isAvailable ?? true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error('Name and price are required');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      if (editing) {
        await adminAPI.updateMenuItem(editing.id, payload);
        toast.success('Menu item updated');
      } else {
        await adminAPI.createMenuItem(selectedRestaurant.id, payload);
        toast.success('Menu item created');
      }
      setShowModal(false);
      // Refresh menu
      const { data } = await adminAPI.getMenu(selectedRestaurant.id);
      setMenuItems(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (menuId) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await adminAPI.deleteMenuItem(menuId);
      toast.success('Menu item deleted');
      setMenuItems((prev) => prev.filter((m) => m.id !== menuId));
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: '#1a1a1a',
    border: '1px solid #333', borderRadius: '8px', color: '#fafafa',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = { color: '#a3a3a3', fontSize: '13px', marginBottom: '4px', display: 'block' };

  if (loading) {
    return (
      <div>
        <h1 style={{ color: '#fafafa', fontSize: '24px', fontWeight: 700 }}>Manage Menu</h1>
        <div style={{ height: '200px', background: '#1a1a1a', borderRadius: '16px', animation: 'pulse 1.5s infinite', marginTop: '24px' }} />
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px', background: '#141414', borderRadius: '16px', border: '1px solid #262626' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <div style={{ color: '#fafafa', fontSize: '18px', fontWeight: 600 }}>No restaurants found</div>
        <div style={{ color: '#737373', fontSize: '14px', marginTop: '8px' }}>Create a restaurant first to manage its menu</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ color: '#fafafa', fontSize: '24px', fontWeight: 700, margin: 0 }}>Manage Menu</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={selectedRestaurant?.id || ''}
            onChange={(e) => {
              const r = restaurants.find((r) => r.id === parseInt(e.target.value));
              setSelectedRestaurant(r);
            }}
            style={{
              ...inputStyle, width: 'auto', minWidth: '200px',
              cursor: 'pointer',
            }}
          >
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <button
            onClick={openCreate}
            style={{
              background: 'linear-gradient(135deg, #e23744, #ff6b6b)',
              color: '#fff', border: 'none', padding: '10px 20px',
              borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
              whiteSpace: 'nowrap',
            }}
          >
            + Add Item
          </button>
        </div>
      </div>

      {menuLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: '70px', borderRadius: '12px', background: '#1a1a1a', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : menuItems.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 24px',
          background: '#141414', borderRadius: '16px', border: '1px solid #262626',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🍽️</div>
          <div style={{ color: '#a3a3a3', fontSize: '15px' }}>No menu items for this restaurant</div>
        </div>
      ) : (
        <div style={{
          background: '#141414', border: '1px solid #262626', borderRadius: '16px',
          overflow: 'hidden',
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 80px 100px 60px 60px 120px',
            padding: '14px 20px', borderBottom: '1px solid #262626',
            gap: '12px',
          }}>
            {['Item', 'Price', 'Category', 'Veg', 'Avail', 'Actions'].map((h) => (
              <div key={h} style={{ color: '#737373', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>{h}</div>
            ))}
          </div>

          {/* Table Rows */}
          {menuItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 80px 100px 60px 60px 120px',
                padding: '12px 20px', borderBottom: '1px solid #1f1f1f',
                alignItems: 'center', gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt="" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                )}
                <span style={{ color: '#fafafa', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
              </div>
              <div style={{ color: '#fafafa', fontSize: '14px' }}>₹{item.price}</div>
              <div style={{ color: '#a3a3a3', fontSize: '12px' }}>{item.category}</div>
              <div style={{ fontSize: '16px' }}>{item.isVeg ? '🟢' : '🔴'}</div>
              <div style={{ fontSize: '16px' }}>{item.isAvailable ? '✅' : '❌'}</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => openEdit(item)} style={{ background: '#262626', color: '#fafafa', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
                <button onClick={() => handleDelete(item.id)} style={{ background: 'rgba(239,68,68,.15)', color: '#ef4444', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── MODAL ─── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '24px',
        }}>
          <form
            onSubmit={handleSubmit}
            style={{
              background: '#141414', border: '1px solid #262626',
              borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '500px',
              maxHeight: '90vh', overflowY: 'auto',
            }}
          >
            <h2 style={{ color: '#fafafa', fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>
              {editing ? 'Edit Menu Item' : 'Add Menu Item'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dish name" />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Price (₹) *</label>
                  <input style={inputStyle} type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="299" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Category</label>
                  <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {['Main Course', 'Starters', 'Desserts', 'Beverages', 'Breads', 'Sides', 'Pizzas', 'Burgers', 'Sushi', 'Bowls', 'Salads', 'Brunch', 'Wraps', 'Tacos', 'Burritos', 'Pasta', 'Snacks', 'Pastries'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" />
              </div>
              <div>
                <label style={labelStyle}>Image URL</label>
                <input style={inputStyle} value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a3a3a3', fontSize: '14px' }}>
                  <input type="checkbox" checked={form.isVeg} onChange={(e) => setForm({ ...form, isVeg: e.target.checked })} style={{ accentColor: '#22c55e' }} />
                  Vegetarian
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a3a3a3', fontSize: '14px' }}>
                  <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} style={{ accentColor: '#e23744' }} />
                  Available
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ background: '#262626', color: '#fafafa', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ background: 'linear-gradient(135deg, #e23744, #ff6b6b)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
};

export default ManageMenu;
