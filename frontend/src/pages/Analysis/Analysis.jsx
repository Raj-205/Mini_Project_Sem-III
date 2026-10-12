import { useCallback, useEffect, useMemo, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement,
  Filler, Title, Tooltip, Legend,
} from 'chart.js';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPath';
import { formatCurrency } from '../../utils/helper';
import { useTheme } from '../../context/themeContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Title, Tooltip, Legend);

const PALETTE = ['#0ea5e9', '#9333ea', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#14b8a6', '#64748b'];
const REFRESH_MS = 30000;

const Analysis = () => {
  const { theme } = useTheme();
  const [a, setA] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);

  const fetchAnalysis = useCallback(async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.ANALYSIS);
      setA(res.data);
      setUpdatedAt(new Date());
      setError('');
    } catch (err) {
      console.error('Analysis fetch error:', err);
      setError(err.response?.data?.message || 'Could not load analysis. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  // "real time": load, poll every 30s, and refresh when the tab regains focus or data changes elsewhere
  useEffect(() => {
    fetchAnalysis();
    const t = setInterval(fetchAnalysis, REFRESH_MS);
    const onFocus = () => fetchAnalysis();
    window.addEventListener('focus', onFocus);
    window.addEventListener('data-changed', onFocus);
    return () => { clearInterval(t); window.removeEventListener('focus', onFocus); window.removeEventListener('data-changed', onFocus); };
  }, [fetchAnalysis]);

  const dark = theme === 'dark';
  const tick = dark ? '#cbd5e1' : '#475569';
  const grid = dark ? '#2f3d5a' : '#e2e8f0';

  const baseOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8, color: tick, font: { weight: 'bold' } } },
      tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${formatCurrency(c.raw)}` } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: tick }, grid: { color: grid, borderDash: [5, 5] } },
      x: { ticks: { color: tick }, grid: { display: false } },
    },
    interaction: { mode: 'index', intersect: false },
  }), [tick, grid]);

  if (loading) return <p style={{ textAlign: 'center', padding: '40px', color: 'var(--ink)' }}>Loading analysis...</p>;
  if (error && !a) return <p style={{ textAlign: 'center', padding: '40px', color: '#dc2626' }}>{error}</p>;
  if (!a) return null;

  const { currentMonth: cur, previousMonth: prev } = a;
  const noData = a.totals.income === 0 && a.totals.expense === 0;

  // ---- line chart: cumulative spend, this month vs last month
  const maxDays = Math.max(a.dailyCumulative.previous.length, a.dayOfMonth);
  const lineData = {
    labels: Array.from({ length: maxDays }, (_, i) => `${i + 1}`),
    datasets: [
      { label: `${prev.label} (full month)`, data: a.dailyCumulative.previous, borderColor: '#94a3b8', backgroundColor: 'rgba(148,163,184,0.15)', tension: 0.3, pointRadius: 0, fill: true },
      { label: `${cur.label} (so far)`, data: a.dailyCumulative.current, borderColor: '#dc2626', backgroundColor: 'rgba(220,38,38,0.15)', tension: 0.3, pointRadius: 2, fill: true },
    ],
  };
  const lineOptions = {
    ...baseOptions,
    scales: { ...baseOptions.scales, x: { ...baseOptions.scales.x, title: { display: true, text: 'Day of month', color: tick } } },
  };

  // ---- bar chart: income vs expense, last 6 months
  const barData = {
    labels: a.monthly.map((m) => m.label),
    datasets: [
      { label: 'Income', data: a.monthly.map((m) => m.income), backgroundColor: '#22c55e', borderRadius: 6 },
      { label: 'Expense', data: a.monthly.map((m) => m.expense), backgroundColor: '#ef4444', borderRadius: 6 },
    ],
  };

  // ---- doughnut: this month's expenses by category
  const doughnutData = {
    labels: a.categories.map((c) => c.category),
    datasets: [{ data: a.categories.map((c) => c.amount), backgroundColor: a.categories.map((_, i) => PALETTE[i % PALETTE.length]), borderWidth: 0 }],
  };
  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false, cutout: '62%',
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, color: tick } },
      tooltip: { callbacks: { label: (c) => ` ${c.label}: ${formatCurrency(c.raw)}` } },
    },
  };

  const change = a.expenseChangePct;
  const changeText = change === null ? 'No spending last month to compare' : `${change <= 0 ? '↓' : '↑'} ${Math.abs(change)}% ${change <= 0 ? 'less' : 'more'} than ${prev.label}`;
  const changeColor = change === null ? 'var(--muted)' : change <= 0 ? '#16a34a' : '#dc2626';

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Spend Analysis</div>
          <div className="page-sub">Live charts built from your own income and expenses</div>
        </div>
        <div className="live-pill"><span className="live-dot"></span>Live · updated {updatedAt?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}</div>
      </div>

      {/* Summary cards */}
      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-label">Spent in {cur.label}</div>
          <div className="stat-value" style={{ color: '#dc2626' }}>{formatCurrency(cur.expense)}</div>
          <div className="stat-foot" style={{ color: changeColor, fontWeight: 'bold' }}>{changeText}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Earned in {cur.label}</div>
          <div className="stat-value" style={{ color: '#16a34a' }}>{formatCurrency(cur.income)}</div>
          <div className="stat-foot">
            {a.savingsRate === null ? 'No income recorded this month' : `Savings rate ${a.savingsRate}% (${formatCurrency(cur.savings)} left)`}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Daily Average ({cur.label})</div>
          <div className="stat-value">{formatCurrency(a.dailyAverage)}</div>
          <div className="stat-foot">{a.topCategory ? `Top category: ${a.topCategory.category} (${formatCurrency(a.topCategory.amount)})` : 'No expenses yet this month'}</div>
        </div>
      </div>

      {noData && (
        <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '20px' }}>
          No data yet — add some income and expenses and these charts will fill in automatically.
        </p>
      )}

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Cumulative spending</h3>
          <div className="chart-sub">{cur.label} vs {prev.label}, day by day</div>
          <div className="chart-box"><Line data={lineData} options={lineOptions} /></div>
        </div>
        <div className="chart-card">
          <h3>Where your money went</h3>
          <div className="chart-sub">{cur.label} expenses by category</div>
          <div className="chart-box">
            {a.categories.length > 0 ? <Doughnut data={doughnutData} options={doughnutOptions} /> : <p style={{ color: 'var(--muted)', textAlign: 'center', paddingTop: '110px' }}>No expenses this month</p>}
          </div>
        </div>
      </div>

      <div className="chart-card" style={{ marginBottom: '24px' }}>
        <h3>Income vs expense</h3>
        <div className="chart-sub">Last 6 months</div>
        <div className="chart-box"><Bar data={barData} options={baseOptions} /></div>
      </div>
    </div>
  );
};

export default Analysis;
