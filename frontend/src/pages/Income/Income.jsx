import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPath';
import { formatCurrency, formatDate } from '../../utils/helper';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ source: '', amount: '', date: '' });
  const [error, setError] = useState('');

  const fetchIncomes = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.INCOME);
      setIncomes(res.data);
    } catch (err) {
      console.error('Fetch income error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIncomes(); }, []);

  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const highestIncome = incomes.length > 0 ? Math.max(...incomes.map(i => i.amount)) : 0;

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axiosInstance.post(API_PATHS.INCOME, form);
      setForm({ source: '', amount: '', date: '' });
      setShowForm(false);
      fetchIncomes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add income');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`${API_PATHS.INCOME}/${id}`);
      setIncomes(incomes.filter(i => i._id !== id));
    } catch (err) {
      console.error('Delete income error:', err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Income Overview</div>
          <div className="page-sub">Track all your money inflows</div>
        </div>
        <div className="page-actions">
          <button className="btn-add" onClick={() => setShowForm(!showForm)}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            Add Income
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-top"><div className="stat-icon icon-green"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg></div></div>
          <div className="stat-label">Total Income</div>
          <div className="stat-value" style={{color:'#16a34a'}}>{formatCurrency(totalIncome)}</div>
          <div className="stat-foot">{incomes.length} transactions</div>
        </div>
        <div className="stat-card">
          <div className="stat-top"><div className="stat-icon icon-purple"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg></div></div>
          <div className="stat-label">Highest Single Income</div>
          <div className="stat-value">{formatCurrency(highestIncome)}</div>
          <div className="stat-foot">largest boost</div>
        </div>
        <div className="stat-card">
          <div className="stat-top"><div className="stat-icon" style={{background:'#fef9c3',color:'#ca8a04'}}><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/></svg></div></div>
          <div className="stat-label">Average per Transaction</div>
          <div className="stat-value">{formatCurrency(incomes.length > 0 ? totalIncome / incomes.length : 0)}</div>
          <div className="stat-foot">per entry</div>
        </div>
      </div>

      {showForm && (
        <div className="form-card" style={{borderLeft:'4px solid #16a34a'}}>
          <h3>Add New Income</h3>
          {error && <p style={{color:'red', marginBottom:'12px'}}>{error}</p>}
          <form onSubmit={handleAdd}>
            <div className="form-row">
              <input type="text" placeholder="Source (e.g. Freelance)" value={form.source} onChange={e => setForm({...form, source: e.target.value})} required />
              <input type="number" placeholder="Amount (Rs)" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-save" style={{ background: '#16a34a' }}>Save Income</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <h3 style={{ padding: '20px', margin: 0, fontSize: '17px', borderBottom: '1px solid #f1f5f9' }}>Income History</h3>
        {loading ? (
          <p style={{padding:'24px', color:'#94a3b8'}}>Loading...</p>
        ) : incomes.length === 0 ? (
          <p style={{padding:'24px', color:'#94a3b8', textAlign:'center'}}>No income records yet. Add your first income!</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Source</th><th>Date</th><th>Amount</th><th style={{textAlign:'right'}}>Actions</th></tr></thead>
            <tbody>
              {incomes.map(inc => (
                <tr key={inc._id}>
                  <td style={{fontWeight:'600'}}>{inc.source}</td>
                  <td>{formatDate(inc.date)}</td>
                  <td className="td-amount-green">{formatCurrency(inc.amount)}</td>
                  <td style={{textAlign:'right'}}>
                    <button className="btn-delete" onClick={() => handleDelete(inc._id)}>
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    </button>
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

export default Income;
