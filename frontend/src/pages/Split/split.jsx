import { useCallback, useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPath';
import { formatCurrency, formatDate, todayStr } from '../../utils/helper';

const emptyForm = { title: '', category: '', totalAmount: '', date: '' };
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const Split = () => {
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [friends, setFriends] = useState([]);        // [{ username, name, registered, share }]
  const [friendInput, setFriendInput] = useState('');
  const [lookupMsg, setLookupMsg] = useState('');
  const [mode, setMode] = useState('equal');         // equal | custom
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchSplits = useCallback(async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.SPLITS);
      setSplits(res.data);
    } catch (err) {
      console.error('Error fetching splits:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSplits();
    // refresh when a notification is accepted/declined
    window.addEventListener('data-changed', fetchSplits);
    const t = setInterval(fetchSplits, 20000); // friends accept -> payer sees status change
    return () => { window.removeEventListener('data-changed', fetchSplits); clearInterval(t); };
  }, [fetchSplits]);

  // ---- live share preview
  const total = Number(form.totalAmount) || 0;
  const preview = useMemo(() => {
    if (friends.length === 0 || total <= 0) return { shares: [], mine: total };
    if (mode === 'custom') {
      const shares = friends.map((f) => Number(f.share) || 0);
      return { shares, mine: round2(total - shares.reduce((a, b) => a + b, 0)) };
    }
    const each = Math.floor((total / (friends.length + 1)) * 100) / 100;
    return { shares: friends.map(() => each), mine: round2(total - each * friends.length) };
  }, [friends, total, mode]);

  const addFriend = async (e) => {
    e?.preventDefault();
    const uname = friendInput.trim();
    setLookupMsg('');
    if (!uname) return;
    if (friends.some((f) => f.username.toLowerCase() === uname.toLowerCase() || f.name.toLowerCase() === uname.toLowerCase())) {
      setLookupMsg('Already added.');
      return;
    }
    try {
      const res = await axiosInstance.get(API_PATHS.USER_LOOKUP, { params: { username: uname } });
      if (res.data.found) {
        const u = res.data.user;
        setFriends((f) => [...f, { username: u.username, name: u.fullName, registered: true, share: '' }]);
        setLookupMsg(`Found @${u.username} — they will get a notification.`);
      } else {
        setFriends((f) => [...f, { username: '', name: uname, registered: false, share: '' }]);
        setLookupMsg(`"${uname}" is not on this site, added as a guest (no notification will be sent).`);
      }
      setFriendInput('');
    } catch (err) {
      setLookupMsg(err.response?.data?.message || 'Could not look up that username.');
    }
  };

  const removeFriend = (i) => setFriends((f) => f.filter((_, idx) => idx !== i));
  const setShare = (i, v) => setFriends((f) => f.map((x, idx) => (idx === i ? { ...x, share: v } : x)));

  const resetForm = () => { setForm(emptyForm); setFriends([]); setFriendInput(''); setLookupMsg(''); setMode('equal'); setError(''); };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (friends.length === 0) return setError('Add at least one friend to split with.');
    if (mode === 'custom') {
      if (friends.some((f) => !(Number(f.share) > 0))) return setError('Enter a share for every friend.');
      if (preview.mine < 0) return setError("Friends' shares are more than the total bill.");
    }
    setSaving(true);
    try {
      await axiosInstance.post(API_PATHS.SPLITS, {
        title: form.title,
        category: form.category || 'Split',
        totalAmount: Number(form.totalAmount),
        date: form.date,
        friends: friends.map((f) => ({
          username: f.registered ? f.username : '',
          name: f.name,
          ...(mode === 'custom' ? { share: Number(f.share) } : {}),
        })),
      });
      resetForm();
      setShowForm(false);
      fetchSplits();
      window.dispatchEvent(new Event('data-changed')); // payer's share was added to Expenses
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save split');
    } finally {
      setSaving(false);
    }
  };

  // ---- stat cards
  const paidByMe = splits.filter((s) => s.role === 'payer');
  const owedToMe = paidByMe.reduce((sum, s) => sum + s.participants.filter((p) => p.status !== 'declined').reduce((a, p) => a + p.share, 0), 0);
  const pendingCount = paidByMe.reduce((n, s) => n + s.participants.filter((p) => p.status === 'pending').length, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Split Expenses</div>
          <div className="page-sub">Pay the full bill, split it with friends</div>
        </div>
        <div className="page-actions">
          <button className="btn-add btn-add-purple" onClick={() => setShowForm(!showForm)}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
            New Split
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-top"><div className="stat-icon icon-purple"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M14 4l2.29 2.29-2.88 2.88 1.42 1.42 2.88-2.88L20 10V4zm-4 0H4v6l2.29-2.29 4.71 4.7V20h2v-8.41L7.71 6.29z" /></svg></div></div>
          <div className="stat-label">Bills You Split</div>
          <div className="stat-value">{paidByMe.length}</div>
          <div className="stat-foot">you paid the full amount</div>
        </div>
        <div className="stat-card">
          <div className="stat-top"><div className="stat-icon icon-green"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" /></svg></div></div>
          <div className="stat-label">Friends Owe You</div>
          <div className="stat-value" style={{ color: '#16a34a' }}>{formatCurrency(owedToMe)}</div>
          <div className="stat-foot">across all splits</div>
        </div>
        <div className="stat-card">
          <div className="stat-top"><div className="stat-icon icon-red"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg></div></div>
          <div className="stat-label">Waiting for Reply</div>
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-foot">friends yet to accept</div>
        </div>
      </div>

      {showForm && (
        <div className="form-card" style={{ borderLeft: '4px solid #9333ea' }}>
          <h3>Split a New Bill</h3>
          {error && <p style={{ color: '#dc2626', marginBottom: '12px' }}>{error}</p>}
          <form onSubmit={handleSave}>
            <div className="form-row">
              <input type="text" placeholder="What was it for? (e.g. Pizza night)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <input type="number" min="1" step="0.01" placeholder="Total bill you paid (Rs)" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} required />
              <input type="date" max={todayStr()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="form-row" style={{ marginTop: '14px', gridTemplateColumns: '1fr' }}>
              <input type="text" placeholder="Category (e.g. Food) — optional" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>

            {/* add friends by username */}
            <div className="split-friend-row">
              <input
                type="text"
                placeholder="Friend's username"
                value={friendInput}
                onChange={(e) => setFriendInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addFriend(e); }}
              />
              <button type="button" className="btn-find" onClick={addFriend}>Add friend</button>
            </div>
            <div className="split-hint">{lookupMsg || 'If your friend uses this site, type their username — they get a notification. Otherwise a plain name is added as a guest.'}</div>

            {friends.length > 0 && (
              <>
                <div className="split-mode">
                  <button type="button" className={mode === 'equal' ? 'on' : ''} onClick={() => setMode('equal')}>Split equally</button>
                  <button type="button" className={mode === 'custom' ? 'on' : ''} onClick={() => setMode('custom')}>Custom amounts</button>
                </div>

                <div className="friend-chips">
                  {friends.map((f, i) => (
                    <div className="friend-chip" key={`${f.username || f.name}-${i}`}>
                      <div className="fc-info">
                        <div className="fc-name">{f.name}</div>
                        <div className="fc-sub">{f.registered ? `@${f.username} · gets notification` : 'guest'}</div>
                      </div>
                      {mode === 'custom' ? (
                        <input type="number" min="0" step="0.01" placeholder="Share" value={f.share} onChange={(e) => setShare(i, e.target.value)} />
                      ) : (
                        <div className="fc-share">{formatCurrency(preview.shares[i] || 0)}</div>
                      )}
                      <button type="button" className="fc-x" onClick={() => removeFriend(i)} aria-label="Remove friend">×</button>
                    </div>
                  ))}
                </div>

                <div className="split-summary">
                  <span>Your own share (added to your expenses): <strong>{formatCurrency(preview.mine)}</strong></span>
                  <span>Friends owe you: <strong>{formatCurrency(preview.shares.reduce((a, b) => a + b, 0))}</strong></span>
                </div>
              </>
            )}

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => { resetForm(); setShowForm(false); }}>Cancel</button>
              <button type="submit" className="btn-save-green" disabled={saving}>{saving ? 'Saving...' : 'Save Split'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <h3 style={{ padding: '20px', margin: 0, fontSize: '17px', borderBottom: '1px solid var(--line)' }}>Splits &amp; Shared Costs</h3>
        {loading ? (
          <p style={{ padding: '24px', color: '#94a3b8' }}>Loading...</p>
        ) : splits.length === 0 ? (
          <p style={{ padding: '24px', color: '#94a3b8', textAlign: 'center' }}>No splits yet. Click “New Split” to share your first bill!</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Bill</th><th>Date</th><th>Total</th><th>Your Share</th><th>Shared With</th></tr>
            </thead>
            <tbody>
              {splits.map((s) => (
                <tr key={s._id}>
                  <td style={{ fontWeight: '600' }}>
                    {s.title}
                    <div style={{ fontSize: '12px', fontWeight: 400, color: 'var(--muted)' }}>
                      {s.role === 'payer' ? 'You paid' : `Paid by ${s.paidBy.fullName} (@${s.paidBy.username})`}
                    </div>
                  </td>
                  <td>{formatDate(s.date)}</td>
                  <td>{formatCurrency(s.totalAmount)}</td>
                  <td className="td-amount-red">{formatCurrency(s.myShare)}</td>
                  <td className="split-person">
                    {s.role === 'payer' ? (
                      s.participants.map((p, i) => (
                        <div key={i}>
                          {p.name}{p.username ? ` (@${p.username})` : ''}: <strong>{formatCurrency(p.share)}</strong>{' '}
                          <span className={`badge ${p.status}`}>{p.status}</span>
                        </div>
                      ))
                    ) : (
                      <span className={`badge ${s.myStatus}`}>{s.myStatus}</span>
                    )}
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

export default Split;
