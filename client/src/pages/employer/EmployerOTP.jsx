import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { EnvelopeIcon, KeyIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function EmployerOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email] = useState(location.state?.email || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const [shakeState, setShakeState] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const otpVal = otp.join('');

  // Auto-verify OTP when all 6 digits are typed
  useEffect(() => {
    if (otpVal.length === 6 && !isOtpVerified) {
      autoVerifyOtp(otpVal);
    }
  }, [otpVal]);

  const autoVerifyOtp = async (otpValue) => {
    setLoading(true);
    setErrorState(false);
    try {
      await api.post('/employer/verify-otp-only', { email, otp: otpValue });
      setIsOtpVerified(true);
      toast.success('OTP verified! Please set your password.');
    } catch (err) {
      setErrorState(true);
      setShakeState(true);
      toast.error(err.response?.data?.message || 'Incorrect OTP code');
      // Trigger shake and reset inputs
      setTimeout(() => {
        setShakeState(false);
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (target, index) => {
    if (isNaN(target.value)) return;
    
    const value = target.value;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && target.nextSibling) {
      target.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      // If current field is empty, clear previous field and focus it
      if (otp[index] === '' && e.target.previousSibling) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        e.target.previousSibling.focus();
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleRegisterComplete = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      const res = await api.post('/employer/verify-otp', { email, otp: otpVal, password });
      login(res.data.token, res.data.user, 'employer');
      toast.success('Account setup complete! Welcome to PROVEXA.');
      navigate('/employer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete registration');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/employer/resend-otp', { email });
      toast.success('OTP resent to your email');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute w-80 h-80 rounded-full bg-purple-500/10 blur-3xl -top-20 -left-20" />
      <div className="absolute w-80 h-80 rounded-full bg-fuchsia-500/10 blur-3xl -bottom-20 -right-20" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <Link to="/" className="text-xl font-black text-white tracking-wider">🛡️ PROVEXA</Link>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 sm:p-8 text-center text-white shadow-2xl">
          {/* Top Back Button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white mb-6 transition-colors group"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" /> Back
          </button>

          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full ${isOtpVerified ? 'bg-green-500/20' : 'bg-purple-500/20'}`}>
              {isOtpVerified ? (
                <KeyIcon className="w-10 h-10 text-green-400" />
              ) : (
                <EnvelopeIcon className="w-10 h-10 text-purple-400" />
              )}
            </div>
          </div>
          
          <h1 className="text-xl font-bold text-white mb-2">
            {isOtpVerified ? 'Set Your Password' : 'Verify Your Email'}
          </h1>
          <p className="text-sm text-white/60 mb-6">
            {isOtpVerified 
              ? 'Provide a secure password for logging in to your employer portal.' 
              : `We sent a 6-digit OTP to ${email || 'your email'}. Enter it below.`}
          </p>

          {!isOtpVerified ? (
            <div>
              {/* 6 Digit OTP Input Boxes */}
              <div className={`flex justify-center gap-1.5 sm:gap-2 mb-6 ${shakeState ? 'animate-shake' : ''}`}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(e.target, idx)}
                    onKeyDown={e => handleKeyDown(e, idx)}
                    className={`w-9 h-9 sm:w-12 sm:h-12 border rounded-lg sm:rounded-xl text-center text-lg sm:text-xl font-bold bg-slate-950/40 focus:outline-none transition-all duration-200 ${
                      isOtpVerified
                        ? 'border-green-500 text-green-400 bg-green-500/10 focus:border-green-500 focus:ring-green-500'
                        : errorState
                        ? 'border-red-500 text-red-400 bg-red-500/10 focus:border-red-500 focus:ring-red-500'
                        : 'border-white/20 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                    }`}
                  />
                ))}
              </div>

              {loading && <p className="text-xs text-white/50">Verifying code...</p>}

              <button onClick={handleResend} disabled={resending || loading} className="mt-4 text-sm text-purple-400 hover:underline disabled:opacity-50">
                {resending ? 'Resending...' : "Didn't receive it? Resend OTP"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegisterComplete} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Choose Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm placeholder-white/30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm placeholder-white/30"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm mt-2 transition-colors">
                {loading ? 'Completing registration...' : 'Complete Registration'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
