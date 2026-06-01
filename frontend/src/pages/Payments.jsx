import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Search, DollarSign, CreditCard, Calendar, Clock, RefreshCw } from 'lucide-react';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/payments');
      if (response.data.success) {
        setPayments(response.data.payments);
      }
    } catch (err) {
      console.error(err);
      setError('Error loading payments registers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((p) => {
    const booking = p.booking || {};
    const matchesSearch =
      booking.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.razorpayPaymentId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter ? p.method === methodFilter : true;

    return matchesSearch && matchesMethod;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade">
      {/* Header bar controls */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-brand-textDark tracking-tight">Earnings & Payments</h1>
          <p className="text-xs text-brand-textSecondary mt-0.5">Audit transaction ledgers, payment modes, and online gateways.</p>
        </div>
        <button className="text-xs font-semibold text-brand-textSecondary border border-brand-border bg-white hover:text-brand-accent hover:border-brand-accent py-2.5 px-5 rounded-lg flex items-center gap-1.5 transition-all duration-300 shadow-soft" onClick={fetchPayments} disabled={loading}>
          <RefreshCw size={14} /> Sync Ledger
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-brand-border/60 rounded-xl p-5 shadow-soft flex gap-4 flex-wrap items-center">
        <div className="relative flex-1 min-w-[240px] flex items-center">
          <Search size={15} className="absolute left-3.5 text-brand-textMuted" />
          <input
            type="text"
            placeholder="Search booking ID, customer name, razorpay ID..."
            className="w-full bg-brand-light/35 border border-brand-border rounded-lg py-2.5 pl-10 pr-3 text-xs outline-none transition-all duration-300 focus:border-brand-accent focus:ring-3 focus:ring-brand-accentGlow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="bg-brand-light/35 border border-brand-border rounded-lg py-2.5 px-3 text-xs outline-none transition-all duration-300 focus:border-brand-accent"
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
        >
          <option value="">All Channels</option>
          <option value="Cash">Cash Ledgers</option>
          <option value="Razorpay">Razorpay Checkout</option>
        </select>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-brand-border/60 rounded-xl p-6 shadow-soft hover:shadow-premium transition-all duration-300">
        {loading ? (
          <div className="flex h-[30vh] items-center justify-center text-brand-accent">
            <p className="text-xs font-semibold">Gathering payments ledgers...</p>
          </div>
        ) : error ? (
          <p className="text-brand-danger text-center text-xs font-semibold">{error}</p>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Mobile View: Cards */}
            <div className="md:hidden flex flex-col gap-3">
              {filteredPayments.length === 0 ? (
                <div className="bg-white border border-brand-border rounded-xl p-6 text-center text-brand-textSecondary text-xs">
                  No payment records found.
                </div>
              ) : (
                filteredPayments.map((p) => {
                  const b = p.booking || {};
                  return (
                    <div key={p._id} className={`bg-white border border-brand-border/60 rounded-xl p-3 shadow-sm flex flex-col gap-2.5 transition-all duration-300 border-l-4 ${
                      p.status === 'Paid' ? 'border-l-brand-success' : 'border-l-brand-danger'
                    }`}>
                      {/* Top line: ID, Turf, Status */}
                      <div className="flex items-center justify-between border-b border-brand-border/40 pb-1.5">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-brand-textDark">{b.bookingId || 'N/A'}</span>
                          <span className="text-[9px] text-brand-textSecondary font-bold">{b.turf?.name || 'Deleted Turf'}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${
                          p.status === 'Paid'
                            ? 'bg-green-50 text-green-600 border-green-200'
                            : p.status === 'Refunded'
                            ? 'bg-yellow-50 text-yellow-600 border-yellow-200'
                            : 'bg-red-50 text-red-600 border-red-200'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      
                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xxs">
                        {/* Player */}
                        <div>
                          <span className="text-[9px] text-brand-textMuted uppercase block font-bold">Player Details</span>
                          <p className="mt-0.5 truncate font-extrabold text-brand-textDark text-[11px]">{b.customerName || 'N/A'}</p>
                          <p className="text-[9px] text-brand-textSecondary truncate font-medium">{b.customerPhone || 'N/A'}</p>
                        </div>
                        {/* Date & Slot (Date small, Slot big) */}
                        <div>
                          <span className="text-[9px] text-brand-textMuted uppercase block font-bold">Reserved Timing</span>
                          <div className="flex items-center gap-1 mt-0.5 text-[9px] text-brand-textSecondary font-semibold">
                            <Calendar size={10} className="text-brand-textMuted shrink-0" />
                            <span className="truncate">{b.date || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-brand-textDark font-bold">
                            <Clock size={11} className="text-brand-accent shrink-0" />
                            <span className="text-xs font-black tracking-tight text-brand-textDark">{b.slot || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xxs border-t border-brand-border/40 pt-1.5">
                        {/* Identifiers */}
                        <div>
                          <span className="text-[9px] text-brand-textMuted uppercase block font-bold">Razorpay Identifiers</span>
                          {p.method === 'Razorpay' ? (
                            <div className="text-[9px] text-brand-textSecondary flex flex-col gap-0.5 mt-0.5 font-medium">
                              <div className="truncate"><strong className="text-brand-textMuted font-bold">Pay ID:</strong> {p.razorpayPaymentId || 'Pending'}</div>
                              <div className="truncate"><strong className="text-brand-textMuted font-bold">Ord ID:</strong> {p.razorpayOrderId?.slice(0, 10)}...</div>
                            </div>
                          ) : (
                            <span className="text-brand-textMuted italic text-[9px] block mt-0.5 font-semibold">Cash Register Entry</span>
                          )}
                        </div>
                        {/* Total Paid */}
                        <div>
                          <span className="text-[9px] text-brand-textMuted uppercase block font-bold">Total Paid</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] font-black text-brand-textDark">₹{p.amount}</span>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                              p.method === 'Cash'
                                ? 'bg-brand-highlight text-brand-accent border-brand-border'
                                : 'bg-green-50 text-green-600 border-green-200'
                            }`}>
                              {p.method}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-brand-border/30 pt-1 text-[8px] text-brand-textMuted text-right font-medium">
                        Transacted: {new Date(p.createdAt).toLocaleString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto border border-brand-border rounded-lg shadow-soft">
              <table className="min-w-full divide-y divide-brand-border/40 text-xs">
                <thead className="bg-brand-light/50">
                  <tr>
                    <th className="px-5 py-3 text-left font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">Booking ID</th>
                    <th className="px-5 py-3 text-left font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">Player Name</th>
                    <th className="px-5 py-3 text-left font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">Turf</th>
                    <th className="px-5 py-3 text-left font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">Reserved Timing</th>
                    <th className="px-5 py-3 text-left font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">Amount</th>
                    <th className="px-5 py-3 text-left font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">Checkout Mode</th>
                    <th className="px-5 py-3 text-left font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">Razorpay Identifiers</th>
                    <th className="px-5 py-3 text-left font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">Status</th>
                    <th className="px-5 py-3 text-left font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">Transaction Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-brand-border/30">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-5 py-8 text-center text-brand-textSecondary">
                        No payment records found.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => {
                      const b = p.booking || {};
                      return (
                        <tr key={p._id} className="hover:bg-brand-light/30 transition-all duration-300">
                          <td className="px-5 py-3.5 font-bold text-brand-textDark whitespace-nowrap">{b.bookingId || 'N/A'}</td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div>
                              <div className="font-bold text-brand-textDark">{b.customerName || 'N/A'}</div>
                              <span className="text-[10px] text-brand-textMuted">{b.customerPhone || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap font-semibold text-brand-textDark">{b.turf?.name || 'Deleted Turf'}</td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div>
                              <div className="flex items-center gap-1 font-semibold text-brand-textDark">
                                <Calendar size={11} className="text-brand-accent" /> {b.date || 'N/A'}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-brand-textSecondary mt-0.5">
                                <Clock size={9} /> {b.slot || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap font-bold text-brand-textDark">₹{p.amount}</td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                              p.method === 'Cash'
                                ? 'bg-brand-highlight text-brand-accent border-brand-border'
                                : 'bg-green-50 text-green-600 border-green-200'
                            }`}>
                              {p.method}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            {p.method === 'Razorpay' ? (
                              <div className="text-[10px] text-brand-textSecondary flex flex-col gap-0.5">
                                <div><strong className="text-brand-textMuted font-bold">Pay ID:</strong> {p.razorpayPaymentId || 'Pending'}</div>
                                <div><strong className="text-brand-textMuted font-bold">Ord ID:</strong> {p.razorpayOrderId?.slice(0, 15)}...</div>
                              </div>
                            ) : (
                              <span className="text-brand-textMuted italic text-[10px]">Direct Cash Checkout</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                              p.status === 'Paid'
                                ? 'bg-green-50 text-green-600 border-green-200'
                                : p.status === 'Refunded'
                                ? 'bg-yellow-50 text-yellow-600 border-yellow-200'
                                : 'bg-red-50 text-red-600 border-red-200'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-brand-textSecondary text-[10px]">
                            {new Date(p.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Payments;
