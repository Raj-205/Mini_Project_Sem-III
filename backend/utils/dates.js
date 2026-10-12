// Reject dates after "today". Dates come from <input type="date"> (YYYY-MM-DD, stored as UTC midnight).
// A 24h tolerance covers users whose local day is ahead of the server's UTC day (e.g. India early morning).
// The date picker already blocks future days in the browser; this is the server-side safety net.
const isFutureDate = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return true;
    return d.getTime() > Date.now() + 24 * 60 * 60 * 1000;
};

module.exports = { isFutureDate };
