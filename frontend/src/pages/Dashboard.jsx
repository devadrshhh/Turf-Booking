import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { Html5Qrcode } from 'html5-qrcode';
import {
  CalendarCheck,
  MapPin,
  Clock,
  Sparkles,
  RefreshCw,
  QrCode,
  Camera,
  CheckCircle2,
  AlertTriangle,
  X,
  User,
  Mail,
  Phone,
  ShieldAlert,
  Upload,
  Plus
} from 'lucide-react';

// QR Viewfinder component using html5-qrcode
const QrCameraScanner = ({ onScanned, onClose }) => {
  const [cameras, setCameras] = useState([]);
  const [activeCameraId, setActiveCameraId] = useState('');
  const [scanError, setScanError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = React.useRef(null);

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Auto-select back camera or first device
          const backCam = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
          setActiveCameraId(backCam ? backCam.id : devices[0].id);
        } else {
          setScanError('No camera devices detected on this system.');
        }
      })
      .catch((err) => {
        console.error('Error getting cameras:', err);
        setScanError('Webcam permission requested or permission denied.');
      });

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async (cameraId) => {
    try {
      if (scannerRef.current) {
        await stopScanner();
      }
      setScanError('');
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;
      
      setIsScanning(true);
      await html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 220, height: 220 }
        },
        (decodedText) => {
          stopScanner();
          onScanned(decodedText);
        },
        (errorMessage) => {
          // Silently capture or ignore scanner frame processing failures
        }
      );
    } catch (err) {
      console.error('Error starting QR scanner:', err);
      setScanError('Camera initialization failed or already active elsewhere.');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error('Failed to stop scanner:', err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (activeCameraId) {
      startScanner(activeCameraId);
    }
  }, [activeCameraId]);

  return (
    <div className="flex flex-col gap-4 items-center w-full">
      {scanError && (
        <div className="bg-red-50 text-red-600 border border-red-200 text-xs p-3 rounded-lg flex items-center gap-2 w-full">
          <AlertTriangle size={15} className="shrink-0" />
          <span>{scanError}</span>
        </div>
      )}

      {cameras.length > 1 && (
        <div className="w-full">
          <label className="text-[10px] font-bold text-brand-textMuted uppercase block mb-1">Select Viewfinder Device</label>
          <select
            value={activeCameraId}
            onChange={(e) => setActiveCameraId(e.target.value)}
            className="w-full text-xs bg-white border border-brand-border rounded-lg p-2 text-brand-textDark focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none font-semibold"
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label || `Camera ${camera.id}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="relative w-full aspect-square max-w-[200px] sm:max-w-[240px] bg-slate-900 border border-brand-border rounded-xl overflow-hidden shadow-inner flex items-center justify-center mx-auto">
        <div id="qr-reader" className="w-full h-full object-cover"></div>
        {!isScanning && !scanError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-textMuted bg-slate-900/90 p-4 text-center">
            <Camera size={32} className="animate-pulse text-brand-accent mb-2" />
            <p className="text-[11px] font-semibold">Starting camera...</p>
          </div>
        )}
      </div>
      
      <p className="text-[10px] text-brand-textMuted font-semibold text-center mt-1">
        Align the receipt QR code in the square frame to scan.
      </p>
    </div>
  );
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  // QR Scan States
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState('scan'); // 'scan', 'details', 'success'
  const [scanTab, setScanTab] = useState('camera'); // 'camera', 'manual'
  const [manualInput, setManualInput] = useState('');
  const [scannedBooking, setScannedBooking] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [isSubmittingVerify, setIsSubmittingVerify] = useState(false);

  const handleBookingLookup = async (idOrJson) => {
    setLookupError('');
    let bookingId = idOrJson.trim();

    // Check if input is a JSON string from a QR code
    if (bookingId.startsWith('{')) {
      try {
        const parsed = JSON.parse(bookingId);
        if (parsed.bookingId) {
          bookingId = parsed.bookingId;
        }
      } catch (err) {
        console.warn('Attempted to parse JSON input, but failed. Using raw string.', err);
      }
    }

    if (!bookingId) {
      setLookupError('Please enter a valid Booking ID or QR code text.');
      return;
    }

    try {
      setLookupError('');
      const response = await axiosInstance.get(`/bookings/lookup/${bookingId}`);
      if (response.data.success) {
        setScannedBooking(response.data.booking);
        setScannerMode('details');
      }
    } catch (err) {
      console.error('Failed to lookup booking:', err);
      setLookupError(err.response?.data?.message || 'Booking not found with the provided ID.');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLookupError('');
    try {
      const html5QrCode = new Html5Qrcode("qr-reader-file");
      const decodedText = await html5QrCode.scanFile(file, false);
      await handleBookingLookup(decodedText);
    } catch (err) {
      console.error('Failed to parse QR code from file:', err);
      setLookupError('Could not find a valid QR Code in the uploaded image. Please make sure the image is clear and well-lit.');
    }
  };

  const handleVerifyTicket = async () => {
    if (!scannedBooking) return;
    setIsSubmittingVerify(true);
    setLookupError('');
    try {
      const response = await axiosInstance.put(`/bookings/verify/${scannedBooking._id}`);
      if (response.data.success) {
        setScannerMode('success');
        // Refresh dashboard metrics
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Failed to verify booking ticket:', err);
      setLookupError(err.response?.data?.message || 'Error occurred during ticket verification.');
    } finally {
      setIsSubmittingVerify(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axiosInstance.get('/dashboard/analytics');
      if (response.data.success) {
        setData(response.data.analytics);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      setError('Error loading analytics. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-brand-accent">
        <div className="text-center">
          <div className="border-[3px] border-brand-highlight border-l-brand-accent rounded-full w-9 h-9 animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-brand-textSecondary">Syncing metrics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white border border-brand-border rounded-xl p-8 text-center text-brand-danger shadow-soft max-w-lg mx-auto">
        <p className="font-semibold text-sm">{error || 'An error occurred loading insights.'}</p>
      </div>
    );
  }

  const { todayBookings, recentBookings } = data;

  const cardStats = [
    { label: "Today's Bookings", value: todayBookings, icon: CalendarCheck, color: '#10b981' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade">
      
      {/* Dashboard Top Header Controls */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-brand-textDark tracking-tight flex items-center gap-1.5">
            Dashboard Overview <Sparkles size={16} className="text-brand-warning animate-pulse" />
          </h1>
          <p className="text-xs text-brand-textSecondary mt-0.5">Real-time scheduling analytics and administrative controls.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/bookings?new=true"
            className="text-xs font-bold text-white bg-brand-accent hover:bg-brand-accent/90 py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all duration-300 shadow-soft hover:shadow-premium"
          >
            <Plus size={13} /> New Booking
          </Link>
          <button
            onClick={() => {
              setIsScanModalOpen(true);
              setScannerMode('scan');
              setLookupError('');
            }}
            className="text-xs font-semibold text-brand-textSecondary border border-brand-border hover:border-brand-accent bg-white hover:text-brand-accent py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all duration-300 shadow-soft"
          >
            <QrCode size={13} /> Scan QR Code
          </button>
          <button
            onClick={() => {
              setLoading(true);
              fetchAnalytics();
            }}
            className="text-xs font-semibold text-brand-textSecondary border border-brand-border hover:border-brand-accent bg-white hover:text-brand-accent py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all duration-300 shadow-soft"
          >
            <RefreshCw size={13} /> Sync Ledger
          </button>
        </div>
      </div>

      {/* Stats Cards Dashboard Grid */}
      <div className="grid grid-cols-1 max-w-sm gap-4">
        {cardStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white border border-brand-border/60 border-l-4 border-l-brand-success rounded-xl p-5 shadow-soft hover:shadow-premium transition-all duration-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-brand-textMuted uppercase tracking-wider block">{stat.label}</span>
                <span className="text-xl font-extrabold text-brand-textDark mt-1 block leading-tight">{stat.value}</span>
              </div>
              <div
                className="p-3 rounded-lg border flex items-center justify-center shrink-0"
                style={{
                  color: stat.color,
                  backgroundColor: `${stat.color}08`,
                  borderColor: `${stat.color}18`
                }}
              >
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabular summary list */}
      <div className="bg-white border border-brand-border/60 rounded-xl p-6 shadow-soft hover:shadow-premium transition-all duration-300">
        <div>
          <h3 className="font-bold text-sm text-brand-textDark">Recent Activity Logs</h3>
          <p className="text-xxs text-brand-textMuted font-semibold mt-0.5">Summary ledger of last 5 slot reservations</p>
        </div>

        {/* Mobile View for Recent Bookings (shown as compact cards) */}
        <div className="md:hidden mt-4 flex flex-col gap-2.5">
          {recentBookings.length === 0 ? (
            <div className="bg-white border border-brand-border rounded-xl p-6 text-center text-brand-textSecondary text-xs">
              No bookings logged yet.
            </div>
          ) : (
            recentBookings.map((b) => (
              <div key={b._id} className={`bg-white border border-brand-border/60 rounded-xl p-3 shadow-sm flex flex-col gap-2.5 transition-all duration-300 border-l-4 ${
                b.status === 'Confirmed' ? 'border-l-brand-success' : 'border-l-brand-danger'
              }`}>
                {/* ID & Status */}
                <div className="flex items-center justify-between border-b border-brand-border/40 pb-1.5">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-brand-textDark">{b.bookingId}</span>
                    <span className="text-[9px] text-brand-textSecondary font-bold">{b.turf?.name || 'Deleted Turf'}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${
                    b.isVerified
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : b.status === 'Confirmed'
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : 'bg-red-50 text-red-600 border-red-200'
                  }`}>
                    {b.isVerified ? 'Expired' : b.status}
                  </span>
                </div>
                
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-2 text-xxs">
                  <div>
                    <span className="text-[9px] text-brand-textMuted uppercase block font-bold">Player Info</span>
                    <p className="mt-0.5 truncate font-extrabold text-brand-textDark text-[11px]">{b.customerName}</p>
                    <p className="text-[9px] text-brand-textSecondary truncate font-medium">{b.customerPhone}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-brand-textMuted uppercase block font-bold">Reservation Timing</span>
                    <div className="flex items-center gap-1 mt-0.5 text-[9px] text-brand-textSecondary font-semibold">
                      <MapPin size={10} className="text-brand-textMuted shrink-0" />
                      <span className="truncate">{b.date}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-brand-textDark font-black">
                      <Clock size={11} className="text-brand-accent shrink-0" />
                      <span className="text-xs font-black tracking-tight text-brand-textDark">{b.slot}</span>
                    </div>
                  </div>
                </div>

                {/* Paid Info */}
                <div className="flex items-center justify-between border-t border-brand-border/40 pt-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-brand-textMuted uppercase font-bold">Paid Cost:</span>
                    <span className="text-[11px] font-black text-brand-textDark">₹{b.finalAmount}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                      b.paymentMethod === 'Cash'
                        ? 'bg-brand-highlight text-brand-accent border-brand-border'
                        : 'bg-green-50 text-green-600 border-green-200'
                    }`}>
                      {b.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View for Recent Bookings (traditional table) */}
        <div className="hidden md:block overflow-x-auto mt-4 border border-brand-border rounded-lg shadow-soft">
          <table className="min-w-full divide-y divide-brand-border/40 text-xs">
            <thead className="bg-brand-light/50">
              <tr>
                <th className="px-5 py-3 text-left font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">Booking ID</th>
                <th className="px-5 py-3 text-left font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">Turf</th>
                <th className="px-5 py-3 text-left font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">Player Info</th>
                <th className="px-5 py-3 text-left font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">Reservation Timing</th>
                <th className="px-5 py-3 text-left font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">Paid Amount</th>
                <th className="px-5 py-3 text-left font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">Checkout Mode</th>
                <th className="px-5 py-3 text-left font-bold text-brand-textSecondary uppercase tracking-wider text-[10px]">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-brand-border/30">
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-6 text-center text-brand-textSecondary">
                    No bookings logged yet.
                  </td>
                </tr>
              ) : (
                recentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-brand-light/30 transition-all duration-300">
                    <td className="px-5 py-3.5 font-bold text-brand-textDark whitespace-nowrap">{b.bookingId}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div>
                        <div className="font-bold text-brand-textDark">{b.turf?.name || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div>
                        <div className="font-semibold text-brand-textDark">{b.customerName}</div>
                        <span className="text-[10px] text-brand-textMuted">{b.customerPhone}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div>
                        <div className="flex items-center gap-1 font-semibold text-brand-textDark">
                          <MapPin size={11} className="text-brand-accent" /> {b.date}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-brand-textSecondary mt-0.5">
                          <Clock size={9} /> {b.slot}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-bold text-brand-textDark">₹{b.finalAmount}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                        b.paymentMethod === 'Cash'
                          ? 'bg-brand-highlight text-brand-accent border-brand-border'
                          : 'bg-green-50 text-green-600 border-green-200'
                      }`}>
                        {b.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                        b.isVerified
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : b.status === 'Confirmed'
                          ? 'bg-green-50 text-green-600 border-green-200'
                          : 'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        {b.isVerified ? 'Expired' : b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Ticket Verification Modal */}
      {isScanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-brand-textDark/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
          <div className="bg-white border-0 sm:border border-brand-border/80 w-full sm:max-w-md h-screen sm:h-auto rounded-none sm:rounded-2xl shadow-soft overflow-hidden animate-slide-up flex flex-col max-h-screen sm:max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="border-b border-brand-border/60 p-4 pt-7 sm:p-4 flex items-center justify-between bg-gradient-to-r from-brand-accent/5 to-transparent">
              <div className="flex items-center gap-2">
                <div className="bg-brand-accent/10 p-2 rounded-lg text-brand-accent">
                  <QrCode size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-brand-textDark tracking-tight">Verify Booking Receipt</h3>
                  <p className="text-[10px] text-brand-textSecondary mt-0.5">Admin check-in ledger console</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsScanModalOpen(false);
                  setScannerMode('scan');
                  setScannedBooking(null);
                  setLookupError('');
                  setManualInput('');
                }}
                className="p-1.5 rounded-lg border border-brand-border/60 text-brand-textSecondary hover:text-brand-textDark bg-white hover:bg-brand-light transition-all duration-300"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3 sm:gap-4 overflow-hidden justify-between">
              
              {/* Display errors */}
              {lookupError && (
                <div className="bg-red-50 text-red-600 border border-red-200 text-xs p-3 rounded-lg flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span className="font-medium">{lookupError}</span>
                </div>
              )}

              {/* Mode 1: SCAN / INPUT */}
              {scannerMode === 'scan' && (
                <div className="flex-1 flex flex-col gap-3 justify-between overflow-hidden">
                  <div className="flex flex-col gap-3">
                    {/* Tabs */}
                    <div className="flex bg-brand-light p-1 rounded-lg border border-brand-border/40">
                      <button
                        onClick={() => { setScanTab('camera'); setLookupError(''); }}
                        className={`flex-1 text-center py-1.5 text-xs font-bold rounded-md transition-all duration-300 flex items-center justify-center gap-1.5 ${
                          scanTab === 'camera'
                            ? 'bg-white text-brand-accent shadow-sm'
                            : 'text-brand-textSecondary hover:text-brand-textDark'
                        }`}
                      >
                        <Camera size={13} /> Camera Viewfinder
                      </button>
                      <button
                        onClick={() => { setScanTab('upload'); setLookupError(''); }}
                        className={`flex-1 text-center py-1.5 text-xs font-bold rounded-md transition-all duration-300 flex items-center justify-center gap-1.5 ${
                          scanTab === 'upload'
                            ? 'bg-white text-brand-accent shadow-sm'
                            : 'text-brand-textSecondary hover:text-brand-textDark'
                        }`}
                      >
                        <Upload size={13} /> Upload QR Image
                      </button>
                    </div>

                    {scanTab === 'camera' ? (
                      <QrCameraScanner
                        onScanned={(text) => handleBookingLookup(text)}
                        onClose={() => setIsScanModalOpen(false)}
                      />
                    ) : (
                      <div className="flex flex-col gap-3 w-full">
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-brand-border hover:border-brand-accent rounded-2xl p-5 bg-brand-light/30 transition-all duration-300 relative group cursor-pointer max-w-[200px] mx-auto w-full">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          />
                          <div className="flex flex-col items-center gap-1.5 text-center text-brand-textSecondary group-hover:text-brand-accent transition-all duration-300">
                            <div className="p-2.5 bg-brand-accent/5 rounded-full border border-brand-border/40 group-hover:border-brand-accent/20 group-hover:bg-brand-accent/10">
                              <Upload size={18} className="text-brand-textMuted group-hover:text-brand-accent transition-all duration-300" />
                            </div>
                            <div>
                              <p className="text-xs font-extrabold text-brand-textDark">Upload QR Image</p>
                              <p className="text-[9px] text-brand-textMuted font-semibold mt-0.5 leading-relaxed">
                                Choose image file
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Hidden div required by html5-qrcode for scanFile helper */}
                        <div id="qr-reader-file" className="hidden"></div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mode 2: TICKET DETAILS */}
              {scannerMode === 'details' && scannedBooking && (
                <div className="flex-1 flex flex-col gap-3 sm:gap-4 justify-between overflow-hidden">
                  <div className="flex flex-col gap-3 sm:gap-4 overflow-hidden">
                    
                    {/* Status Banner */}
                    {scannedBooking.isVerified ? (
                      <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl p-3 flex items-center gap-3">
                        <ShieldAlert size={24} className="text-red-500 shrink-0 animate-pulse" />
                        <div className="text-left flex-1 min-w-0">
                          <span className="font-extrabold text-[11px] uppercase tracking-wide block text-red-800">EXPIRED / TICKET USED</span>
                          <p className="text-[10px] font-semibold text-red-600 leading-tight mt-0.5">
                            Verified: <span className="font-black text-brand-textDark">{new Date(scannedBooking.verifiedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-green-50 text-green-700 border border-green-100 rounded-xl p-3 flex items-center gap-2">
                        <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                        <div className="text-left">
                          <span className="font-extrabold text-[11px] uppercase tracking-wide block text-green-800">VALID TICKET</span>
                          <p className="text-[9px] font-bold text-green-600 mt-0.5 uppercase">Pending check-in registration</p>
                        </div>
                      </div>
                    )}

                    {/* Booking Card Grid */}
                    <div className="bg-brand-light/50 border border-brand-border/60 rounded-xl p-3 sm:p-4 flex flex-col gap-3 overflow-hidden">
                      
                      <div className="flex items-center justify-between border-b border-brand-border/40 pb-2">
                        <span className="text-[10px] font-bold text-brand-textMuted uppercase">Booking Identifier</span>
                        <span className="text-xs font-black text-brand-textDark">{scannedBooking.bookingId}</span>
                      </div>

                      {/* Customer & Booking Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* Customer Info */}
                        <div className="bg-white border border-brand-border/40 rounded-xl p-2.5 sm:p-3 flex flex-col gap-1.5 text-xxs font-bold text-brand-textDark">
                          <span className="text-[8px] font-black text-brand-textMuted uppercase tracking-wider block">Customer Info</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <User size={12} className="text-brand-textMuted shrink-0" />
                            <span className="truncate text-xs font-black">{scannedBooking.customerName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={12} className="text-brand-textMuted shrink-0" />
                            <span className="font-semibold text-brand-textSecondary text-[11px]">{scannedBooking.customerPhone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail size={12} className="text-brand-textMuted shrink-0" />
                            <span className="font-semibold text-brand-textSecondary truncate">{scannedBooking.customerEmail}</span>
                          </div>
                        </div>

                        {/* Turf & Slot Info */}
                        <div className="bg-white border border-brand-border/40 rounded-xl p-2.5 sm:p-3 flex flex-col gap-1.5 text-xxs font-bold text-brand-textDark">
                          <span className="text-[8px] font-black text-brand-textMuted uppercase tracking-wider block">Turf & Session</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <MapPin size={12} className="text-brand-accent shrink-0" />
                            <span className="truncate text-xs font-black">{scannedBooking.turf?.name || 'Main Arena'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarCheck size={12} className="text-brand-accent shrink-0" />
                            <span className="font-semibold text-brand-textSecondary text-[11px]">{scannedBooking.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={12} className="text-brand-accent shrink-0" />
                            <span className="font-bold text-brand-textDark text-xs leading-none">{scannedBooking.slot}</span>
                          </div>
                        </div>
                      </div>

                      {/* Cost & Payment Details */}
                      <div className="flex items-center justify-between bg-white border border-brand-border/40 p-2.5 sm:p-3 rounded-xl text-xs font-bold">
                        <span className="text-brand-textSecondary text-[10px] font-black uppercase tracking-wider">Paid Amount</span>
                        <div className="flex items-center gap-2">
                          <span className="text-brand-textDark text-base font-black">₹{scannedBooking.finalAmount}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                            scannedBooking.paymentStatus === 'Paid'
                              ? 'bg-green-50 text-green-600 border-green-200'
                              : 'bg-yellow-50 text-yellow-600 border-yellow-200'
                          }`}>
                            {scannedBooking.paymentStatus}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-auto pt-3 border-t border-brand-border/40">
                    <button
                      onClick={() => {
                        setScannerMode('scan');
                        setScannedBooking(null);
                        setLookupError('');
                      }}
                      className="flex-1 border border-brand-border hover:bg-brand-light text-brand-textSecondary hover:text-brand-textDark font-extrabold py-2.5 px-4 rounded-xl text-xs transition-all duration-300"
                    >
                      Scan Another
                    </button>
                    {!scannedBooking.isVerified && (
                      <button
                        onClick={handleVerifyTicket}
                        disabled={isSubmittingVerify}
                        className="flex-1 bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all duration-300 shadow-soft hover:shadow-premium"
                      >
                        {isSubmittingVerify ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircle2 size={13} />
                        )}
                        Verify Ticket
                      </button>
                    )}
                  </div>

                </div>
              )}

              {/* Mode 3: SUCCESS */}
              {scannerMode === 'success' && (
                <div className="flex-1 flex flex-col justify-between items-center py-6 text-center gap-4 animate-scale-up overflow-hidden">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-500 shadow-soft animate-pulse">
                      <CheckCircle2 size={36} />
                    </div>
                    
                    <div>
                      <h4 className="font-extrabold text-brand-textDark text-base tracking-tight">Ticket Verified Successfully!</h4>
                      <p className="text-[11px] text-brand-textSecondary mt-1 leading-relaxed max-w-[260px] mx-auto font-semibold">
                        Player check-in logged. The slot allocation is confirmed and receipt verified.
                      </p>
                    </div>

                    {scannedBooking && (
                      <div className="w-full bg-brand-light border border-brand-border/40 rounded-xl p-3 text-xs font-bold text-brand-textSecondary flex flex-col gap-1 max-w-[280px]">
                        <div className="flex justify-between">
                          <span>Player:</span>
                          <span className="text-brand-textDark">{scannedBooking.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Slot Timing:</span>
                          <span className="text-brand-textDark">{scannedBooking.slot}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Date:</span>
                          <span className="text-brand-textDark">{scannedBooking.date}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setScannerMode('scan');
                      setScannedBooking(null);
                      setLookupError('');
                      setManualInput('');
                    }}
                    className="w-full max-w-[200px] bg-brand-accent hover:bg-brand-accent/90 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all duration-300 shadow-soft hover:shadow-premium mt-auto"
                  >
                    Scan Next Ticket
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
