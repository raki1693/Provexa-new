import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const queryRole = searchParams.get('role');
  const [role, setRole] = useState(queryRole || 'student');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify & Reset
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const [shakeState, setShakeState] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const otpVal = otp.join('');

  // Auto-verify OTP in Forgot Password screen when all 6 digits are typed
  useEffect(() => {
    if (otpVal.length === 6 && !isOtpVerified && step === 2) {
      autoVerifyResetOtp(otpVal);
    }
  }, [otpVal, step]);

  const autoVerifyResetOtp = async (otpValue) => {
    setLoading(true);
    setErrorState(false);
    try {
      await api.post(`/${role}/verify-reset-otp`, { email, otp: otpValue });
      setIsOtpVerified(true);
      toast.success('Reset code verified! Please set your new password.');
    } catch (err) {
      setErrorState(true);
      setShakeState(true);
      toast.error(err.response?.data?.message || 'Incorrect reset code');
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

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await api.post(`/${role}/forgot-password`, { email });
      toast.success('Reset code sent! Check your email.');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password) return toast.error('Password is required');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    
    setLoading(true);
    try {
      await api.post(`/${role}/reset-password`, { email, otp: otpVal, password });
      toast.success('Password reset successful! Please log in.');
      navigate(`/${role}/login`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (target, index) => {
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

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
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

  const handleResend = async () => {
    setLoading(true);
    try {
      await api.post(`/${role}/forgot-password`, { email });
      toast.success('Reset code resent to your email');
      setOtp(['', '', '', '', '', '']);
      setIsOtpVerified(false);
      setTimeout(() => {
        document.getElementById('otp-0')?.focus();
      }, 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl -top-20 -left-20" />
      <div className="absolute w-80 h-80 rounded-full bg-purple-500/10 blur-3xl -bottom-20 -right-20" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-white font-black text-xl tracking-wider">
            <ShieldCheckIcon className="w-8 h-8 text-indigo-400" />
            PROVEXA
          </Link>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-white shadow-2xl">
          <h2 className="text-xl font-bold mb-1">Reset Password</h2>
          <p className="text-xs text-white/60 mb-6 font-light">
            Recover access to your secure {queryRole ? `${queryRole} ` : ''}portal account
          </p>

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              {!queryRole && (
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">Select Portal Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  >
                    <option className="bg-slate-950" value="student">Student</option>
                    <option className="bg-slate-950" value="institution">Institution</option>
                    <option className="bg-slate-950" value="employer">Employer</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Registered Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm placeholder-white/30"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-colors"
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white/80 mb-4">
                <p>We sent a 6-digit Reset OTP to <strong className="text-indigo-300">{email}</strong>.</p>
              </div>

              {!isOtpVerified ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-2 text-center">6-Digit Reset Code</label>
                    <div className={`flex justify-center gap-2 mb-4 ${shakeState ? 'animate-shake' : ''}`}>
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(e.target, idx)}
                          onKeyDown={e => handleOtpKeyDown(e, idx)}
                          className={`w-10 h-10 border-2 rounded-xl text-center text-lg font-bold bg-slate-950/40 focus:outline-none transition-all duration-200 ${
                            isOtpVerified
                              ? 'border-green-500 text-green-400 bg-green-500/10 focus:border-green-500 focus:ring-green-500'
                              : errorState
                              ? 'border-red-500 text-red-400 bg-red-500/10 focus:border-red-500 focus:ring-red-500'
                              : 'border-white/20 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {loading && <p className="text-xs text-center text-white/60">Checking Reset Code...</p>}

                  <div className="text-center">
                    <button
                      onClick={handleResend}
                      disabled={loading}
                      className="text-xs text-indigo-400 hover:underline disabled:opacity-50"
                    >
                      Didn't receive code? Resend
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm placeholder-white/30"
                      placeholder="Min 6 characters"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm placeholder-white/30"
                      placeholder="Repeat new password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-colors"
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-between items-center text-xs text-white/60">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-white transition-colors">
              <ArrowLeftIcon className="w-3 h-3" /> Back
            </button>
            <Link to="/" className="hover:underline hover:text-white font-medium">Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
