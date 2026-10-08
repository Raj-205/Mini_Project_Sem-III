import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPath';
import { formatCurrency, formatDate } from '../../utils/helper';

const Expense = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: '', amount: '', date: '' });
  const [error, setError] = useState('');

  const fetchExpenses = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.EXPENSE);
      setExpenses(res.data);
    } catch (err) {
      console.error('Fetch expenses error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const topCategory = expenses.length > 0
    ? [...expenses].sort((a, b) => b.amount - a.amount)[0]
    : null;

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axiosInstance.post(API_PATHS.EXPENSE, form);
      setForm({ category: '', amount: '', date: '' });
      setShowForm(false);
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`${API_PATHS.EXPENSE}/${id}`);
      setExpenses(expenses.filter(e => e._id !== id));
    } catch (err) {
      console.error('Delete expense error:', err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Expense Tracker</div>
          <div className="page-sub">Monitor where your money goes</div>
        </div>
        <div className="page-actions">
          <button className="btn-add btn-add-danger" onClick={() => setShowForm(!showForm)}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            Add Expense
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-top"><div className="stat-icon icon-red"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z"/></svg></div></div>
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value" style={{color:'#dc2626'}}>{formatCurrency(totalExpense)}</div>
          <div className="stat-foot">{expenses.length} transactions</div>
        </div>
        <div className="stat-card">
          <div className="stat-top"><div className="stat-icon icon-purple"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></div></div>
          <div className="stat-label">Top Category</div>
          <div className="stat-value">{topCategory ? topCategory.category : 'N/A'}</div>
          <div className="stat-foot">{topCategory ? formatCurrency(topCategory.amount) + ' spent' : 'No expenses'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-top"><div className="stat-icon icon-green"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/></svg></div></div>
          <div className="stat-label">Daily Average</div>
          <div className="stat-value">{formatCurrency(expenses.length > 0 ? totalExpense / 30 : 0)}</div>
          <div className="stat-foot">based on 30-day month</div>
        </div>
      </div>

      {showForm && (
        <div className="form-card" style={{borderLeft:'4px solid #ef4444'}}>
          <h3>Add New Expense</h3>
          {error && <p style={{color:'red', marginBottom:'12px'}}>{error}</p>}
          <form onSubmit={handleAdd}>
            <div className="form-row">
              <input type="text" placeholder="Category (e.g. Food)" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required />
              <input type="number" placeholder="Amount (Rs)" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-save btn-save-red">Save Expense</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <h3 style={{ padding: '20px', margin: 0, fontSize: '17px', borderBottom: '1px solid #f1f5f9' }}>Recent Expenses</h3>
        {loading ? (
          <p style={{padding:'24px', color:'#94a3b8'}}>Loading...</p>
        ) : expenses.length === 0 ? (
          <p style={{padding:'24px', color:'#94a3b8', textAlign:'center'}}>No expense records yet. Add your first expense!</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Category</th><th>Date</th><th>Amount</th><th style={{textAlign:'right'}}>Actions</th></tr></thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp._id}>
                  <td style={{fontWeight:'600'}}>{exp.category}</td>
                  <td>{formatDate(exp.date)}</td>
                  <td className="td-amount-red">{formatCurrency(exp.amount)}</td>
                  <td style={{textAlign:'right'}}>
                    <button className="btn-delete" onClick={() => handleDelete(exp._id)}>
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

export default Expense;
