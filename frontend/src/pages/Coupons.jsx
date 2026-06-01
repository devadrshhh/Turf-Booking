import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Ticket, Plus, Trash2, ShieldAlert, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('Percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minBookingAmount, setMinBookingAmount] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/coupons');
      if (response.data.success) {
        setCoupons(response.data.coupons);
      }
    } catch (err) {
      console.error(err);
      setError('Error loading coupon registers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggleActive = async (couponId) => {
    try {
      const response = await axiosInstance.put(`/coupons/toggle/${couponId}`);
      if (response.data.success) {
        triggerToast('Coupon state updated');
        await fetchCoupons();
      }
    } catch (err) {
      console.error(err);
      triggerToast('Error toggling coupon.');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await axiosInstance.delete(`/coupons/${couponId}`);
      if (response.data.success) {
        triggerToast('Coupon deleted successfully!');
        await fetchCoupons();
      }
    } catch (err) {
      console.error(err);
      triggerToast('Error deleting coupon.');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    if (!code || !discountValue || !startDate || !endDate) {
      setFormError('Please fill in all required fields.');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minBookingAmount: Number(minBookingAmount || 0),
        maxDiscount: Number(maxDiscount || 0),
        startDate,
        endDate,
      };

      const response = await axiosInstance.post('/coupons', payload);
      if (response.data.success) {
        triggerToast('Coupon created successfully!');
        setModalOpen(false);
        // Reset fields
        setCode('');
        setDiscountValue('');
        setMinBookingAmount('');
        setMaxDiscount('');
        setStartDate('');
        setEndDate('');
        await fetchCoupons();
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to create coupon code.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade">
      {/* Toast Notice */}
      {toastVisible && (
        <div className="fixed top-6 right-6 bg-brand-success text-white px-6 py-4 rounded-xl z-50 shadow-premium flex items-center gap-3 font-semibold animate-slide">
          <Check size={18} />
          {toastMessage}
        </div>
      )}

      {/* Header bar controls */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-brand-textDark tracking-tight">Campaigns & Promotions</h1>
          <p className="text-xs text-brand-textSecondary mt-0.5">Configure client discount codes, valid dates ranges, and min cost limits.</p>
        </div>
        <button className="text-xs font-bold text-white bg-brand-accent hover:bg-brand-accentHover py-2.5 px-5 rounded-lg flex items-center gap-1.5 transition-all duration-300 shadow-premium" onClick={() => setModalOpen(true)}>
          <Plus size={15} /> Add Coupon
        </button>
      </div>

      {/* Coupon Table */}
      <div className="bg-white border border-brand-border/60 rounded-xl p-6 shadow-soft hover:shadow-premium transition-all duration-300">
        {loading ? (
          <div className="flex h-[30vh] items-center justify-center text-brand-accent">
            <p className="text-xs font-semibold">Gathering promotions...</p>
          </div>
        ) : error ? (
          <p className="text-brand-danger text-center text-xs font-semibold">{error}</p>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Mobile View: Cards */}
            <div className="md:hidden flex flex-col gap-3">
              {coupons.length === 0 ? (
                <div className="bg-white border border-brand-border rounded-xl p-6 text-center text-brand-textSecondary text-xs">
                  No active promotion codes found.
                </div>
              ) : (
                coupons.map((c) => (
                  <div key={c._id} className={`bg-white border border-brand-border/60 rounded-xl p-3 shadow-sm flex flex-col gap-2.5 transition-all duration-300 border-l-4 ${
                    c.isActive ? 'border-l-brand-success' : 'border-l-brand-danger'
                  }`}>
                    {/* Top line: Code, Active state, Trash */}
                    <div className="flex items-center justify-between border-b border-brand-border/40 pb-1.5">
                      <span className="text-[11px] font-black text-brand-accent">{c.code}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleActive(c._id)}
                          className={`cursor-pointer transition-all duration-300 ${
                            c.isActive ? 'text-brand-success' : 'text-brand-textMuted'
                          }`}
                        >
                          {c.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(c._id)}
                          className="text-brand-danger hover:bg-brand-danger/5 p-1 rounded-lg border border-brand-danger/10 transition-all duration-300 cursor-pointer"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xxs">
                      <div>
                        <span className="text-[9px] text-brand-textMuted uppercase block font-bold">Discount Value</span>
                        <p className="mt-0.5 font-extrabold text-brand-textDark text-[11px]">
                          {c.discountType === 'Fixed' ? `₹${c.discountValue}` : `${c.discountValue}%`}
                          <span className="text-[8px] text-brand-textMuted font-semibold block font-medium">({c.discountType})</span>
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] text-brand-textMuted uppercase block font-bold">Campaign Limits</span>
                        <p className="mt-0.5 text-brand-textDark"><strong className="text-brand-textMuted font-bold">Min:</strong> ₹{c.minBookingAmount}</p>
                        <p className="text-brand-textDark"><strong className="text-brand-textMuted font-bold">Max:</strong> {c.maxDiscount > 0 ? `₹${c.maxDiscount}` : 'No Cap'}</p>
                      </div>
                    </div>

                    {/* Start / End Dates */}
                    <div className="border-t border-brand-border/40 pt-1.5 grid grid-cols-2 gap-2 text-xxs">
                      <div>
                        <span className="text-[9px] text-brand-textMuted uppercase block font-bold">Start Date</span>
                        <p className="mt-0.5 text-brand-textSecondary font-semibold">{new Date(c.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-brand-textMuted uppercase block font-bold">End Date</span>
                        <p className="mt-0.5 text-brand-textSecondary font-semibold">{new Date(c.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto border border-brand-border rounded-lg shadow-soft">
              <table className="min-w-full divide-y divide-brand-border/40 text-xs">
                <thead className="bg-brand-light/50">
                  <tr>
                    <th className="px-5 py-3 text-left font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">Promo Code</th>
                    <th className="px-5 py-3 text-left font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">Discount Value</th>
                    <th className="px-5 py-3 text-left font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">Min Booking Cost</th>
                    <th className="px-5 py-3 text-left font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">Max Deduction Cap</th>
                    <th className="px-5 py-3 text-left font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">Start Date</th>
                    <th className="px-5 py-3 text-left font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">End Date</th>
                    <th className="px-5 py-3 text-left font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">Status</th>
                    <th className="px-5 py-3 text-right font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-brand-border/30">
                  {coupons.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-5 py-8 text-center text-brand-textSecondary">
                        No active promotion codes found.
                      </td>
                    </tr>
                  ) : (
                    coupons.map((c) => (
                      <tr key={c._id} className="hover:bg-brand-light/30 transition-all duration-300">
                        <td className="px-5 py-3.5 font-extrabold text-brand-accent whitespace-nowrap">{c.code}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap font-bold text-brand-textDark">
                          {c.discountType === 'Fixed' ? `₹${c.discountValue}` : `${c.discountValue}%`}
                          <span className="text-[10px] text-brand-textMuted font-semibold ml-1">({c.discountType})</span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-brand-textDark">₹{c.minBookingAmount}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-brand-textDark">{c.maxDiscount > 0 ? `₹${c.maxDiscount}` : 'No Cap'}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-brand-textSecondary">{new Date(c.startDate).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-brand-textSecondary">{new Date(c.endDate).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleActive(c._id)}
                            className={`cursor-pointer transition-all duration-300 ${
                              c.isActive ? 'text-brand-success' : 'text-brand-textMuted'
                            }`}
                          >
                            {c.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                          </button>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDeleteCoupon(c._id)}
                            className="text-[10px] font-bold text-brand-danger hover:bg-brand-danger/5 py-1.5 px-3 rounded-lg border border-brand-danger/10 transition-all duration-300 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Create Coupon */}
      {modalOpen && (
        <div className="fixed inset-0 bg-brand-textDark/45 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade">
          <div className="bg-white border border-brand-border shadow-premium rounded-xl p-6 md:p-8 max-w-md w-full relative flex flex-col gap-5 animate-fade">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-brand-textSecondary hover:text-brand-accent transition-all duration-300"
            >
              <X size={20} />
            </button>

            <div>
              <h2 className="text-base font-extrabold text-brand-textDark tracking-tight">Create Promo Coupon</h2>
              <p className="text-xs text-brand-textSecondary mt-0.5">Configure client discount settings and limits.</p>
            </div>

            {formError && (
              <div className="flex gap-2 p-3 bg-brand-danger/5 border border-brand-danger/15 rounded-lg text-brand-danger text-xs">
                <ShieldAlert size={15} className="shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xxs font-bold text-brand-textSecondary uppercase tracking-wider">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  className="w-full bg-brand-light/35 border border-brand-border rounded-lg py-2.5 px-3 text-xs outline-none transition-all duration-300 uppercase focus:border-brand-accent"
                  placeholder="E.g., SUMMERSALE"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xxs font-bold text-brand-textSecondary uppercase tracking-wider">Discount Type</label>
                  <select
                    className="bg-brand-light/35 border border-brand-border rounded-lg py-2.5 px-2 text-xs outline-none transition-all duration-300 focus:border-brand-accent"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Cost (₹)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xxs font-bold text-brand-textSecondary uppercase tracking-wider">Discount Value</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-brand-light/35 border border-brand-border rounded-lg py-2.5 px-3 text-xs outline-none transition-all duration-300 focus:border-brand-accent"
                    placeholder={discountType === 'Fixed' ? '₹150' : '15%'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xxs font-bold text-brand-textSecondary uppercase tracking-wider">Min Booking Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-brand-light/35 border border-brand-border rounded-lg py-2.5 px-3 text-xs outline-none transition-all duration-300 focus:border-brand-accent"
                    placeholder="E.g., 600"
                    value={minBookingAmount}
                    onChange={(e) => setMinBookingAmount(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xxs font-bold text-brand-textSecondary uppercase tracking-wider">Max Deduction Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-brand-light/35 border border-brand-border rounded-lg py-2.5 px-3 text-xs outline-none transition-all duration-300 focus:border-brand-accent"
                    placeholder="E.g., 200 (Percentage Only)"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    disabled={discountType === 'Fixed'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xxs font-bold text-brand-textSecondary uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    className="w-full bg-brand-light/35 border border-brand-border rounded-lg py-2.5 px-3 text-xs outline-none transition-all duration-300 focus:border-brand-accent"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xxs font-bold text-brand-textSecondary uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    className="w-full bg-brand-light/35 border border-brand-border rounded-lg py-2.5 px-3 text-xs outline-none transition-all duration-300 focus:border-brand-accent"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2.5 justify-end mt-2">
                <button
                  type="button"
                  className="text-xs font-semibold text-brand-textSecondary border border-brand-border bg-white hover:text-brand-accent hover:border-brand-accent py-2.5 px-4 rounded-lg transition-all duration-300"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="text-xs font-bold text-white bg-brand-accent hover:bg-brand-accentHover py-2.5 px-4 rounded-lg transition-all duration-300 shadow-premium"
                >
                  {submitting ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
