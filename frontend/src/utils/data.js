export const MOCK_DASHBOARD_DATA = {
  totalBalance: 15000,
  totalIncome: 25000,
  totalExpense: 10000,
  recentTransactions: [
    { _id: '1', title: 'Freelance Project', category: 'Income', amount: 5000, type: 'income', date: '2024-09-01' },
    { _id: '2', title: 'Pocket Money', category: 'Income', amount: 2000, type: 'income', date: '2024-09-05' },
    { _id: '3', title: 'Groceries', category: 'Food', amount: 1200, type: 'expense', date: '2024-09-07' },
    { _id: '4', title: 'Transport', category: 'Travel', amount: 300, type: 'expense', date: '2024-09-08' },
    { _id: '5', title: 'Books', category: 'Education', amount: 800, type: 'expense', date: '2024-09-10' },
  ]
};

export const MOCK_HISTORY_DATA = [
  { _id: '1', title: 'Freelance Project', category: 'Income', amount: 5000, type: 'income', date: '2024-09-01' },
  { _id: '2', title: 'Groceries', category: 'Food', amount: 1200, type: 'expense', date: '2024-09-02' },
  { _id: '3', title: 'Bus Pass', category: 'Travel', amount: 300, type: 'expense', date: '2024-09-04' },
  { _id: '4', title: 'Pocket Money', category: 'Income', amount: 2000, type: 'income', date: '2024-09-05' },
  { _id: '5', title: 'Cafe', category: 'Food', amount: 450, type: 'expense', date: '2024-09-06' },
  { _id: '6', title: 'Notebooks', category: 'Education', amount: 800, type: 'expense', date: '2024-09-10' },
  { _id: '7', title: 'Movie Ticket', category: 'Entertainment', amount: 250, type: 'expense', date: '2024-09-12' },
  { _id: '8', title: 'Gym Membership', category: 'Health', amount: 1500, type: 'expense', date: '2024-09-15' },
];

export const MOCK_ANALYSIS_DATA = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [
    {
      label: 'August Expenses',
      data: [2500, 3200, 2100, 2800],
      borderColor: '#94a3b8',
      backgroundColor: 'rgba(148, 163, 184, 0.2)',
      tension: 0.4,
    },
    {
      label: 'September Expenses',
      data: [1500, 2800, 1900, 3100],
      borderColor: '#dc2626',
      backgroundColor: 'rgba(220, 38, 38, 0.2)',
      tension: 0.4,
    }
  ]
};
