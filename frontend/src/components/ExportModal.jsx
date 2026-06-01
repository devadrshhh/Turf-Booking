import React, { useState } from 'react';
import { X, Download, Calendar, CreditCard, BookOpen, AlertTriangle } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

const ExportModal = ({ isOpen, onClose }) => {
  const [exportType, setExportType] = useState('bookings'); // 'bookings' or 'payments'
  const [dateRange, setDateRange] = useState('today'); // 'today', 'last_week', 'last_month', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDownload = async () => {
    setError('');
    setLoading(true);
    try {
      let url = `/bookings/export?type=${exportType}&range=${dateRange}`;
      if (dateRange === 'custom') {
        if (!startDate || !endDate) {
          setError('Please provide both start and end dates.');
          setLoading(false);
          return;
        }
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      // Fetch the xlsx file as a blob
      const response = await axiosInstance.get(url, { responseType: 'blob' });
      
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const filename = `${exportType === 'bookings' ? 'Bookings' : 'Payments'}_Export_${Date.now()}.xlsx`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to download Excel export. Please make sure the server is online.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-textDark/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white border border-brand-border/80 w-full max-w-md rounded-2xl shadow-soft overflow-hidden animate-slide-up flex flex-col">
        
        {/* Header */}
        <div className="border-b border-brand-border/60 p-4 flex items-center justify-between bg-gradient-to-r from-brand-accent/5 to-transparent">
          <div className="flex items-center gap-2">
            <div className="bg-brand-accent/10 p-2 rounded-lg text-brand-accent">
              <Download size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-brand-textDark tracking-tight font-sans">Export Data Report</h3>
              <p className="text-[10px] text-brand-textSecondary mt-0.5 font-semibold">Generate highly styled Excel spreadsheets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-brand-border/60 text-brand-textSecondary hover:text-brand-textDark bg-white hover:bg-brand-light transition-all duration-300"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 text-xs p-3 rounded-lg flex items-center gap-2 font-medium">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Export Type Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-brand-textMuted uppercase tracking-wider block">Export Category</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExportType('bookings')}
                className={`py-3 px-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer font-bold text-xs ${
                  exportType === 'bookings'
                    ? 'border-brand-accent bg-brand-accent/5 text-brand-accent shadow-sm'
                    : 'border-brand-border hover:border-brand-accent/40 bg-white text-brand-textSecondary hover:text-brand-textDark'
                }`}
              >
                <BookOpen size={16} />
                <span>Bookings Ledgers</span>
              </button>

              <button
                type="button"
                onClick={() => setExportType('payments')}
                className={`py-3 px-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer font-bold text-xs ${
                  exportType === 'payments'
                    ? 'border-brand-accent bg-brand-accent/5 text-brand-accent shadow-sm'
                    : 'border-brand-border hover:border-brand-accent/40 bg-white text-brand-textSecondary hover:text-brand-textDark'
                }`}
              >
                <CreditCard size={16} />
                <span>Payments Ledgers</span>
              </button>
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-brand-textMuted uppercase tracking-wider block">Select Timeline Range</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'today', label: 'Today' },
                { id: 'last_week', label: 'Last Week' },
                { id: 'last_month', label: 'Last Month' },
                { id: 'custom', label: 'Custom Range' },
              ].map((rangeOpt) => (
                <button
                  key={rangeOpt.id}
                  type="button"
                  onClick={() => { setDateRange(rangeOpt.id); setError(''); }}
                  className={`py-2 px-3 rounded-lg border text-xxs font-bold transition-all duration-300 cursor-pointer ${
                    dateRange === rangeOpt.id
                      ? 'border-brand-accent bg-brand-accent/5 text-brand-accent'
                      : 'border-brand-border hover:border-brand-accent/30 bg-white text-brand-textSecondary hover:text-brand-textDark'
                  }`}
                >
                  {rangeOpt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Picker Inputs */}
          {dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-3 bg-brand-light/30 border border-brand-border/40 rounded-xl p-3.5 animate-slide-up">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-brand-textMuted uppercase">Start Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xxs font-semibold bg-white border border-brand-border rounded-lg p-2 text-brand-textDark focus:border-brand-accent outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-brand-textMuted uppercase">End Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xxs font-semibold bg-white border border-brand-border rounded-lg p-2 text-brand-textDark focus:border-brand-accent outline-none"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="border-t border-brand-border/60 p-4 bg-brand-light/20 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-brand-border hover:bg-brand-light text-brand-textSecondary hover:text-brand-textDark font-extrabold py-2.5 px-4 rounded-xl text-xs transition-all duration-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={loading}
            className="flex-1 bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all duration-300 shadow-soft hover:shadow-premium"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download size={13} />
            )}
            Download Excel
          </button>
        </div>

      </div>
    </div>
  );
};

export default ExportModal;
