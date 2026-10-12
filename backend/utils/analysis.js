// Pure helpers (no DB) so they are easy to test.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// Dates are stored from <input type="date"> as UTC midnight, so group by UTC parts.
const monthKey = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

function buildAnalysis(incomes, expenses, now = new Date()) {
    const y = now.getUTCFullYear();
    const m = now.getUTCMonth();
    const curKey = monthKey(now);
    const prevKey = monthKey(new Date(Date.UTC(y, m - 1, 1)));
    const daysInCur = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const daysInPrev = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const dayOfMonth = now.getUTCDate();

    // last 6 months, oldest -> newest
    const monthly = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(Date.UTC(y, m - i, 1));
        monthly.push({ key: monthKey(d), label: `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`, income: 0, expense: 0 });
    }
    const monthIdx = Object.fromEntries(monthly.map((x, i) => [x.key, i]));

    const dailyCur = Array(daysInCur).fill(0);
    const dailyPrev = Array(daysInPrev).fill(0);
    const catMap = {};

    incomes.forEach((i) => {
        const k = monthKey(new Date(i.date));
        if (k in monthIdx) monthly[monthIdx[k]].income += i.amount;
    });
    expenses.forEach((e) => {
        const d = new Date(e.date);
        const k = monthKey(d);
        if (k in monthIdx) monthly[monthIdx[k]].expense += e.amount;
        if (k === curKey) {
            dailyCur[d.getUTCDate() - 1] += e.amount;
            catMap[e.category] = (catMap[e.category] || 0) + e.amount;
        } else if (k === prevKey) {
            dailyPrev[d.getUTCDate() - 1] += e.amount;
        }
    });

    monthly.forEach((x) => { x.income = round2(x.income); x.expense = round2(x.expense); });
    const cur = monthly[5];
    const prev = monthly[4];
    const categories = Object.entries(catMap)
        .map(([category, amount]) => ({ category, amount: round2(amount) }))
        .sort((a, b) => b.amount - a.amount);

    const cumulative = (arr) => { let s = 0; return arr.map((v) => (s = round2(s + v))); };
    const changePct = prev.expense > 0 ? round2(((cur.expense - prev.expense) / prev.expense) * 100) : null;

    return {
        currentMonth: { key: curKey, label: cur.label, income: cur.income, expense: cur.expense, savings: round2(cur.income - cur.expense) },
        previousMonth: { key: prevKey, label: prev.label, income: prev.income, expense: prev.expense },
        expenseChangePct: changePct,                       // null when there is no previous-month spending
        dailyAverage: round2(cur.expense / Math.max(dayOfMonth, 1)),
        savingsRate: cur.income > 0 ? round2(((cur.income - cur.expense) / cur.income) * 100) : null,
        topCategory: categories[0] || null,
        dayOfMonth,
        // cumulative spend by day: current month stops at today, previous month runs full length
        dailyCumulative: {
            current: cumulative(dailyCur).slice(0, dayOfMonth),
            previous: cumulative(dailyPrev),
        },
        monthly,
        categories,
        totals: {
            income: round2(incomes.reduce((s, i) => s + i.amount, 0)),
            expense: round2(expenses.reduce((s, e) => s + e.amount, 0)),
        },
    };
}

// Equal split with the rounding remainder landing on the payer.
// customShares: optional array (same order as participants) of numbers.
function computeShares(total, count, customShares) {
    if (customShares && customShares.length === count && customShares.every((s) => Number(s) > 0)) {
        const shares = customShares.map((s) => round2(Number(s)));
        const sum = round2(shares.reduce((a, b) => a + b, 0));
        if (sum > total) throw new Error('Friends\' shares are more than the total bill');
        return { shares, payerShare: round2(total - sum) };
    }
    const each = Math.floor((total / (count + 1)) * 100) / 100;
    const shares = Array(count).fill(round2(each));
    return { shares, payerShare: round2(total - each * count) };
}

module.exports = { buildAnalysis, computeShares, round2 };
