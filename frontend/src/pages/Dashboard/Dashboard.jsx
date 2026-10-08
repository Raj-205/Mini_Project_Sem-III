import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPath';
import { formatCurrency, formatDate } from '../../utils/helper';
import './dashboard.css';

const Dashboard = () => {
  const [data, setData] = useState({ totalBalance: 0, totalIncome: 0, totalExpense: 0, recentTransactions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.DASHBOARD);
        setData(res.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div style={{color:'white', textAlign:'center', paddingTop:'60px', fontSize:'18px'}}>Loading dashboard...</div>;

  return (
    <div>
      {/* Hero */}
      <div className="hero-row">
        <div>
          <div className="eyebrow">Student Budget Overview</div>
          <h1 className="hero-title">Your money,<br /><span className="accent">clear as day.</span></h1>
          <p className="hero-sub">A calm overview of your finances. Track what comes in and goes out — all in one place.</p>
        </div>
        <div className="month-select">
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          <div className="month-tabs">
            <span className="month-tab active">current view</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon icon-green">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
            </div>
          </div>
          <div className="stat-label">Total Balance</div>
          <div className="stat-value">{formatCurrency(data.totalBalance)}</div>
          <div className="stat-foot">available right now</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon icon-green">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
            </div>
          </div>
          <div className="stat-label">Total Income</div>
          <div className="stat-value" style={{color:'#16a34a'}}>{formatCurrency(data.totalIncome)}</div>
          <div className="stat-foot">earned so far</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon icon-red">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z"/></svg>
            </div>
          </div>
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value" style={{color:'#dc2626'}}>{formatCurrency(data.totalExpense)}</div>
          <div className="stat-foot">spent so far</div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="table-card" style={{marginTop:'4px'}}>
        <h3 style={{ padding: '20px 24px', margin: 0, fontSize: '17px', borderBottom: '1px solid #f1f5f9', fontWeight: '700' }}>Recent Transactions</h3>
        {data.recentTransactions.length === 0 ? (
          <p style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No transactions yet. Add your first income or expense!</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Date</th>
                <th style={{textAlign:'right'}}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTransactions.slice(0, 8).map(tx => (
                <tr key={tx._id}>
                  <td style={{fontWeight:'600'}}>{tx.title}</td>
                  <td>
                    <span style={{ padding: '4px 10px', background: '#f1f5f9', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#475569' }}>
                      {tx.category}
                    </span>
                  </td>
                  <td>{formatDate(tx.date)}</td>
                  <td style={{textAlign:'right'}} className={tx.type === 'income' ? 'td-amount-green' : 'td-amount-red'}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
