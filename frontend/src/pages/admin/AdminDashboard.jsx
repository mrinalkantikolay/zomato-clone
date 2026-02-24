import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import adminAPI from '../../api/admin.api';

const COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#e23744', '#8b5cf6', '#6b7280'];
const PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
];

const StatCard = ({ icon, label, value, sub, color }) => (
  <div style={{
    background: 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)',
    border: '1px solid #262626',
    borderRadius: '16px',
    padding: '24px',
    flex: '1 1 200px',
    minWidth: '160px',
  }}>
    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
    <div style={{ color: '#737373', fontSize: '13px', marginBottom: '4px' }}>{label}</div>
    <div style={{ color: color || '#fafafa', fontSize: '28px', fontWeight: 700 }}>{value}</div>
    {sub && <div style={{ color: '#737373', fontSize: '12px', marginTop: '4px' }}>{sub}</div>}
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data } = await adminAPI.getDashboardStats(period);
        setStats(data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [period]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h1 style={{ color: '#fafafa', fontSize: '24px', fontWeight: 700 }}>Dashboard</h1>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{
              flex: '1 1 200px', height: '120px', borderRadius: '16px',
              background: '#1a1a1a', animation: 'pulse 1.5s infinite',
            }} />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div style={{ color: '#a3a3a3', textAlign: 'center', marginTop: '100px' }}>Failed to load dashboard</div>;
  }

  const statusData = Object.entries(stats.ordersByStatus || {}).map(([name, count]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    value: count,
  }));
  const barData = statusData.length > 0 ? statusData : [{ name: 'No Data', value: 0 }];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header with period filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ color: '#fafafa', fontSize: '24px', fontWeight: 700, margin: 0 }}>Dashboard</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              style={{
                background: period === p.value ? '#e23744' : '#262626',
                color: period === p.value ? '#fff' : '#a3a3a3',
                border: 'none', padding: '8px 16px', borderRadius: '8px',
                cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <StatCard icon="🏪" label="My Restaurants" value={stats.totalRestaurants} />
        <StatCard
          icon="💰"
          label="Net Revenue (80%)"
          value={`₹${(stats.netRevenue || 0).toLocaleString('en-IN')}`}
          sub={`Gross: ₹${(stats.grossRevenue || 0).toLocaleString('en-IN')}`}
          color="#22c55e"
        />
        <StatCard icon="📦" label="Total Orders" value={stats.totalOrders} sub={`${stats.todayOrders || 0} today`} />
        <StatCard icon="👥" label="Customers Today" value={stats.todayCustomers || 0} />
        <StatCard icon="🔥" label="Active Orders" value={stats.activeOrders} />
      </div>

      {/* Commission Info */}
      <div style={{
        background: 'linear-gradient(135deg, #1a2e1a, #141414)',
        border: '1px solid #22c55e30',
        borderRadius: '16px', padding: '20px',
      }}>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: '#737373', fontSize: '13px' }}>Gross Revenue</div>
            <div style={{ color: '#fafafa', fontSize: '22px', fontWeight: 700 }}>
              ₹{(stats.grossRevenue || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <div style={{ color: '#737373', fontSize: '13px' }}>Platform Commission ({stats.commissionRate || 20}%)</div>
            <div style={{ color: '#ef4444', fontSize: '22px', fontWeight: 700 }}>
              - ₹{(stats.platformCommission || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <div style={{ color: '#737373', fontSize: '13px' }}>Your Net Revenue</div>
            <div style={{ color: '#22c55e', fontSize: '22px', fontWeight: 700 }}>
              ₹{(stats.netRevenue || 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Per-Restaurant Revenue */}
      {(stats.perRestaurantRevenue || []).length > 0 && (
        <div style={{
          background: '#141414', border: '1px solid #262626',
          borderRadius: '16px', padding: '24px', overflowX: 'auto',
        }}>
          <h3 style={{ color: '#fafafa', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            Per-Restaurant Revenue
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #262626' }}>
                {['Restaurant', 'Orders', 'Gross Revenue', 'Net Revenue'].map((h) => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#737373', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.perRestaurantRevenue.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '12px', color: '#fafafa', fontWeight: 500 }}>{r.restaurantName}</td>
                  <td style={{ padding: '12px', color: '#a3a3a3' }}>{r.orderCount}</td>
                  <td style={{ padding: '12px', color: '#fafafa' }}>₹{r.grossRevenue.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '12px', color: '#22c55e', fontWeight: 600 }}>₹{r.netRevenue.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Charts */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{
          flex: '1 1 400px', background: '#141414', border: '1px solid #262626',
          borderRadius: '16px', padding: '24px',
        }}>
          <h3 style={{ color: '#fafafa', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            Orders by Status
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="name" tick={{ fill: '#737373', fontSize: 12 }} />
              <YAxis tick={{ fill: '#737373', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #262626', borderRadius: '8px', color: '#fafafa' }} />
              <Bar dataKey="value" fill="#e23744" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          flex: '1 1 300px', background: '#141414', border: '1px solid #262626',
          borderRadius: '16px', padding: '24px',
        }}>
          <h3 style={{ color: '#fafafa', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            Order Distribution
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusData.length > 0 ? statusData : [{ name: 'No Orders', value: 1 }]}
                cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                paddingAngle={3} dataKey="value"
              >
                {(statusData.length > 0 ? statusData : [{ name: 'No Orders' }]).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ color: '#a3a3a3', fontSize: '12px' }}
                formatter={(value) => <span style={{ color: '#a3a3a3' }}>{value}</span>} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #262626', borderRadius: '8px', color: '#fafafa' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        background: '#141414', border: '1px solid #262626',
        borderRadius: '16px', padding: '24px',
      }}>
        <h3 style={{ color: '#fafafa', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Quick Overview</h3>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#737373', fontSize: '13px' }}>Recent Orders (7 days)</div>
            <div style={{ color: '#fafafa', fontSize: '24px', fontWeight: 700 }}>{stats.recentOrdersCount || 0}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#737373', fontSize: '13px' }}>Avg. Revenue per Order</div>
            <div style={{ color: '#fafafa', fontSize: '24px', fontWeight: 700 }}>
              ₹{stats.totalOrders > 0 ? Math.round(stats.grossRevenue / stats.totalOrders).toLocaleString('en-IN') : 0}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
