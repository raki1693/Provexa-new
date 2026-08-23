import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { EnvelopeIcon, KeyIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function StudentOTP() {
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
      await api.post('/student/verify-otp-only', { email, otp: otpValue });
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
      const res = await api.post('/student/verify-otp', { email, otp: otpVal, password });
      login(res.data.token, res.data.user, 'student');
      toast.success('Account setup complete! Welcome to PROVEXA.');
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete registration');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/student/resend-otp', { email });
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
    <div className="min-h-screen bg-provexa-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="text-xl font-black text-provexa-navy">🛡️ PROVEXA</Link>
        </div>
        <div className="bg-white rounded-2xl card-shadow p-5 sm:p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full ${isOtpVerified ? 'bg-green-50' : 'bg-blue-50'}`}>
              {isOtpVerified ? (
                <KeyIcon className="w-10 h-10 text-green-600" />
              ) : (
                <EnvelopeIcon className="w-10 h-10 text-provexa-blue" />
              )}
            </div>
          </div>
          
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            {isOtpVerified ? 'Set Your Password' : 'Verify Your Email'}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {isOtpVerified 
              ? 'Provide a secure password for logging in to your student portal.' 
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
                    className={`w-9 h-9 sm:w-12 sm:h-12 border-2 rounded-lg sm:rounded-xl text-center text-lg sm:text-xl font-bold bg-white focus:outline-none transition-all duration-200 ${
                      isOtpVerified
                        ? 'border-green-500 text-green-700 bg-green-50/30 focus:border-green-500 focus:ring-green-500'
                        : errorState
                        ? 'border-red-500 text-red-700 bg-red-50/30 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-200 text-gray-800 focus:border-provexa-blue focus:ring-1 focus:ring-provexa-blue'
                    }`}
                  />
                ))}
              </div>

              {loading && <p className="text-xs text-gray-400">Verifying code...</p>}

              <button onClick={handleResend} disabled={resending || loading} className="mt-4 text-sm text-provexa-blue hover:underline disabled:opacity-50">
                {resending ? 'Resending...' : "Didn't receive it? Resend OTP"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegisterComplete} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Choose Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="input-field focus:ring-provexa-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="input-field focus:ring-provexa-blue"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full bg-green-600 hover:bg-green-700">
                {loading ? 'Completing registration...' : 'Complete Registration'}
              </button>
            </form>
          )}

          <div className="border-t border-gray-100 pt-3 mt-4 flex justify-between items-center text-xs text-gray-500">
            <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-gray-800 transition-colors">
              <ArrowLeftIcon className="w-3 h-3" /> Back
            </button>
            <Link to="/" className="hover:underline hover:text-gray-800">Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
