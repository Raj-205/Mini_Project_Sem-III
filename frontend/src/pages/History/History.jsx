import { useState } from 'react';
import { MOCK_HISTORY_DATA } from '../../utils/data';
import { formatCurrency, formatDate } from '../../utils/helper';

const History = () => {
  const [filter, setFilter] = useState('all');
  
  const filteredData = MOCK_HISTORY_DATA.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Transaction History</div>
          <div className="page-sub">A complete record of your spending and income</div>
        </div>
        <div className="page-actions">
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '12px', border: 'none', outline: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: '600' }}
          >
            <option value="all" style={{color: '#333'}}>All Transactions</option>
            <option value="expense" style={{color: '#333'}}>Expenses Only</option>
            <option value="income" style={{color: '#333'}}>Income Only</option>
          </select>
        </div>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title / Source</th>
              <th>Category</th>
              <th>Date</th>
              <th style={{textAlign:'right'}}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(tx => (
              <tr key={tx._id}>
                <td style={{fontWeight:'600'}}>{tx.title}</td>
                <td>
                  <span style={{ 
                    padding: '4px 10px', 
                    background: '#f1f5f9', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    fontWeight: '600',
                    color: '#475569'
                  }}>
                    {tx.category}
                  </span>
                </td>
                <td>{formatDate(tx.date)}</td>
                <td style={{textAlign:'right'}} className={tx.type === 'income' ? 'td-amount-green' : 'td-amount-red'}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan="4" style={{textAlign:'center', padding: '30px', color: '#94a3b8'}}>No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
