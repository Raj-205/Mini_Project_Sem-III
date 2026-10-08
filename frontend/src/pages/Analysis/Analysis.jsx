import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { MOCK_ANALYSIS_DATA } from '../../utils/data';
import { formatCurrency } from '../../utils/helper';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Analysis = () => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8, font: { weight: 'bold' } } },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${formatCurrency(context.raw)}`
        }
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { borderDash: [5, 5], color: '#e2e8f0' } },
      x: { grid: { display: false } }
    },
    interaction: { mode: 'index', intersect: false }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Spend Analysis</div>
          <div className="page-sub">Compare your spending across the last 2 months</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-label">Total Spent (August)</div>
          <div className="stat-value" style={{ color: '#64748b' }}>{formatCurrency(10600)}</div>
          <div className="stat-foot">Previous Month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Spent (September)</div>
          <div className="stat-value" style={{ color: '#dc2626' }}>{formatCurrency(9300)}</div>
          <div className="stat-foot" style={{ color: '#16a34a', fontWeight: 'bold' }}>↓ 12% decrease</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Daily Average (Sept)</div>
          <div className="stat-value" style={{ color: '#0f172a' }}>{formatCurrency(310)}</div>
          <div className="stat-foot">Projected to be under budget</div>
        </div>
      </div>

      {/* Chart Card */}
      <div className="table-card" style={{ padding: '30px', height: '400px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '20px' }}>Expense Trend</h3>
        <div style={{ height: '300px', width: '100%' }}>
          <Line data={MOCK_ANALYSIS_DATA} options={options} />
        </div>
      </div>
    </div>
  );
};

export default Analysis;
