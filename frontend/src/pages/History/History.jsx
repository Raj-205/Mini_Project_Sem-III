import { useState, useEffect, useCallback } from 'react';
import { formatCurrency, formatDate } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPath';

const History = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.HISTORY);
      setTransactions(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err.response?.data?.message || 'Could not load your history. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    window.addEventListener('data-changed', fetchHistory);
    return () => window.removeEventListener('data-changed', fetchHistory);
  }, [fetchHistory]);

  // DELETE /history/:type/:id  (the backend needs to know income vs expense)
  const handleDelete = async (tx) => {
    try {
      await axiosInstance.delete(`${API_PATHS.HISTORY}/${tx.type}/${tx._id}`);
      setTransactions((list) => list.filter((t) => !(t._id === tx._id && t.type === tx.type)));
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError(err.response?.data?.message || 'Could not delete this transaction');
    }
  };

  const filteredData = transactions.filter((item) => filter === 'all' || item.type === filter);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Transaction History</div>
          <div className="page-sub">A complete record of your spending and income</div>
        </div>
        <div className="page-actions">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
            <option value="all">All Transactions</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>
        </div>
      </div>

      {error && <p style={{ color: '#dc2626', marginBottom: '14px' }}>{error}</p>}

      <div className="table-card">
        {loading ? (
          <p style={{ padding: '24px', color: '#94a3b8' }}>Loading...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Description</th><th>Category</th><th>Date</th><th>Amount</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {filteredData.map((tx) => (
                <tr key={`${tx.type}-${tx._id}`}>
                  <td style={{ fontWeight: '600' }}>{tx.title}</td>
                  <td><span className="cat-chip">{tx.category}</span></td>
                  <td>{formatDate(tx.date)}</td>
                  <td className={tx.type === 'income' ? 'td-amount-green' : 'td-amount-red'}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-delete" onClick={() => handleDelete(tx)}>
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default History;
