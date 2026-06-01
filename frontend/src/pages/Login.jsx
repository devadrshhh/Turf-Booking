import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ShieldAlert, Lock, Mail, TrendingUp, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const { login, loading, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please fill in both email and password credentials.');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-6 bg-[radial-gradient(circle_at_10%_20%,rgba(77,166,255,0.06)_0%,transparent_40%),radial-gradient(circle_at_90%_80%,rgba(16,185,129,0.04)_0%,transparent_40%)]">
      <div className="bg-white border border-brand-border/60 rounded-xl p-8 md:p-10 w-full max-w-[420px] shadow-soft hover:shadow-premium transition-all duration-300 animate-fade flex flex-col gap-6">
        
        {/* Header Branding */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="bg-brand-highlight text-brand-accent p-2.5 rounded-lg border border-brand-border">
            <TrendingUp size={22} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-brand-textDark tracking-tight">Staff Portal</h1>
            <p className="text-xs text-brand-textSecondary mt-1 leading-relaxed">
              Administrative secure login engine
            </p>
          </div>
        </div>

        {/* Dynamic Warning banners */}
        {(formError || authError) && (
          <div className="flex gap-2.5 p-3.5 bg-brand-danger/5 border border-brand-danger/25 rounded-lg text-brand-danger text-xs leading-relaxed items-start">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{formError || authError}</span>
          </div>
        )}

        {/* Inputs form */}
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xxs font-bold text-brand-textSecondary uppercase tracking-wider">
              Administrative Email
            </label>
            <div className="relative flex items-center">
              <Mail size={14} className="absolute left-3.5 text-brand-textMuted" />
              <input
                type="email"
                placeholder="admin@example.com"
                className="w-full bg-brand-light/35 border border-brand-border rounded-lg py-2.5 pl-10 pr-3 text-xs outline-none transition-all duration-300 focus:border-brand-accent focus:ring-3 focus:ring-brand-accentGlow"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFormError('');
                }}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xxs font-bold text-brand-textSecondary uppercase tracking-wider">
              Security Password
            </label>
            <div className="relative flex items-center">
              <Lock size={14} className="absolute left-3.5 text-brand-textMuted" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full bg-brand-light/35 border border-brand-border rounded-lg py-2.5 pl-10 pr-10 text-xs outline-none transition-all duration-300 focus:border-brand-accent focus:ring-3 focus:ring-brand-accentGlow"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFormError('');
                }}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-brand-textSecondary hover:text-brand-accent transition-all duration-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-accent hover:bg-brand-accentHover disabled:bg-brand-textMuted text-white text-xs font-bold py-3 px-4 rounded-lg tracking-wider uppercase transition-all duration-300 mt-2 shadow-premium hover:scale-[1.01]"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="border-2 border-white/20 border-l-white rounded-full w-4.5 h-4.5 animate-spin" />
                Verifying Credentials...
              </div>
            ) : (
              'Sign In Securely'
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;
