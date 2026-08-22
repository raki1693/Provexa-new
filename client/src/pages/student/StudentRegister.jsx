import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AcademicCapIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function StudentRegister() {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', rollNumber: '', institutionName: '', institution: '' });
  const [loading, setLoading] = useState(false);
  
  // Availability status state: null, 'checking', 'available', 'taken', 'invalid-length'
  const [emailStatus, setEmailStatus] = useState(null);
  const [rollStatus, setRollStatus] = useState(null);

  const [institutions, setInstitutions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchingInst, setSearchingInst] = useState(false);

  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleInstitutionChange = async (e) => {
    const value = e.target.value;
    setForm({ ...form, institutionName: value, institution: '' });

    if (value.trim().length >= 3) {
      setSearchingInst(true);
      try {
        const res = await api.get(`/institution/search?q=${encodeURIComponent(value)}`);
        setInstitutions(res.data.data || []);
        setShowDropdown(true);
      } catch (err) {
        setInstitutions([]);
      } finally {
        setSearchingInst(false);
      }
    } else {
      setInstitutions([]);
      setShowDropdown(false);
    }
  };

  // Debounced Email Check (2 seconds delay)
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email) {
      setEmailStatus(null);
      return;
    }
    if (!emailRegex.test(form.email)) {
      setEmailStatus('incomplete');
      return;
    }
    setEmailStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await api.post('/student/check-availability', { email: form.email });
        setEmailStatus(res.data.emailAvailable ? 'available' : 'taken');
      } catch {
        setEmailStatus(null);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [form.email]);

  // Debounced Roll Number Check (2 seconds delay)
  useEffect(() => {
    if (!form.rollNumber) {
      setRollStatus(null);
      return;
    }
    if (form.rollNumber.trim().length < 5) {
      setRollStatus('invalid-length');
      return;
    }
    setRollStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await api.post('/student/check-availability', { rollNumber: form.rollNumber });
        setRollStatus(res.data.rollNumberAvailable ? 'available' : 'taken');
      } catch {
        setRollStatus(null);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [form.rollNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate Roll Number minLength
    if (form.rollNumber && form.rollNumber.trim().length < 5) {
      return toast.error('Roll number must be at least 5 digits/characters');
    }

    // Block submission if values are already taken or invalid
    if (emailStatus === 'incomplete') return toast.error('Please enter a complete and valid email address');
    if (emailStatus === 'taken') return toast.error('Email is already registered');
    if (rollStatus === 'taken') return toast.error('Roll number is already taken');

    setLoading(true);
    try {
      await api.post('/student/register', form);
      toast.success('Registration request sent! Please verify your email.');
      navigate('/student/verify-otp', { state: { email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute w-80 h-80 rounded-full bg-blue-500/10 blur-3xl -top-20 -left-20" />
      <div className="absolute w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl -bottom-20 -right-20" />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-6">
          <Link to="/" className="text-xl font-black text-white tracking-wider">🛡️ PROVEXA</Link>
          <div className="flex items-center justify-center gap-2 mt-2 text-white">
            <AcademicCapIcon className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold">Student Registration</h1>
          </div>
          <p className="text-xs text-white/60 mt-1">Create your student account to access PROVEXA</p>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 sm:p-8 text-white shadow-2xl">
          {/* Top Back Button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white mb-6 transition-colors group"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" /> Back
          </button>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Full Name *</label>
                <input
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-white/30"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Mobile Number *</label>
                <input
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-white/30"
                  value={form.mobile}
                  onChange={set('mobile')}
                  placeholder="9876543210"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-white/80 mb-1">Email Address *</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-white/30"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="you@example.com"
                  required
                />
                {emailStatus === 'incomplete' && <p className="text-[10px] text-orange-400 mt-0.5">⚠ Please enter a complete and valid email address</p>}
                {emailStatus === 'checking' && <p className="text-[10px] text-white/50 mt-0.5">⏳ Checking availability...</p>}
                {emailStatus === 'available' && <p className="text-[10px] text-green-400 mt-0.5">✓ Email is available</p>}
                {emailStatus === 'taken' && <p className="text-[10px] text-red-400 mt-0.5">✗ Email is already registered</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Roll Number</label>
                <input
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-white/30"
                  value={form.rollNumber}
                  onChange={set('rollNumber')}
                  placeholder="Min 5 characters"
                />
                {rollStatus === 'checking' && <p className="text-[10px] text-white/50 mt-0.5">⏳ Checking availability...</p>}
                {rollStatus === 'available' && <p className="text-[10px] text-green-400 mt-0.5">✓ Roll number is available</p>}
                {rollStatus === 'taken' && <p className="text-[10px] text-red-400 mt-0.5">✗ Roll number is already taken</p>}
                {rollStatus === 'invalid-length' && <p className="text-[10px] text-orange-400 mt-0.5">⚠ Must be at least 5 characters</p>}
              </div>
              <div className="sm:col-span-2 relative">
                <label className="block text-xs font-semibold text-white/80 mb-1">Institution Name</label>
                <input
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-white/30"
                  value={form.institutionName}
                  onChange={handleInstitutionChange}
                  placeholder="Type college/university name..."
                  onFocus={() => { if (form.institutionName.length >= 3) setShowDropdown(true); }}
                  onBlur={() => setShowDropdown(false)}
                />
                
                {searchingInst && (
                  <p className="text-[10px] text-white/60 mt-1 absolute right-3 top-10">⏳ Searching...</p>
                )}

                {showDropdown && institutions.length > 0 && (
                  <ul className="absolute z-20 w-full mt-1 bg-slate-950/95 border border-white/20 rounded-lg max-h-48 overflow-y-auto text-sm text-white shadow-xl divide-y divide-white/5">
                    {institutions.map(inst => (
                      <li
                        key={inst._id}
                        onMouseDown={() => {
                          setForm({ ...form, institutionName: inst.name, institution: inst._id });
                          setShowDropdown(false);
                        }}
                        className="px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors"
                      >
                        {inst.name}
                      </li>
                    ))}
                  </ul>
                )}
                {showDropdown && institutions.length === 0 && form.institutionName.trim().length >= 3 && !searchingInst && (
                  <div className="absolute z-20 w-full mt-1 bg-slate-950/95 border border-white/20 rounded-lg p-3 text-xs text-white/50 shadow-xl">
                    No approved institutions found matching "{form.institutionName}"
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm mt-2 transition-colors"
            >
              {loading ? 'Submitting Registration...' : 'Verify Email & Continue'}
            </button>
          </form>

          <p className="text-sm text-center text-white/70 mt-5">
            Already have an account?{' '}
            <Link to="/student/login" className="text-blue-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
