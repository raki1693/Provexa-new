import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldCheckIcon, AcademicCapIcon, BuildingLibraryIcon, BriefcaseIcon, CheckBadgeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const roles = [
  {
    icon: AcademicCapIcon,
    title: 'Student',
    description: 'View your academic certificates issued by your institution. Download, share, and verify them instantly.',
    path: '/student/login',
    gradient: 'student-gradient',
    light: 'bg-blue-50',
    accent: 'text-blue-700',
    border: 'border-blue-100',
    btnClass: 'bg-provexa-navy hover:bg-blue-900',
    features: ['View all issued certificates', 'Download QR-verified PDFs', 'Share verification links', 'Self-verify authenticity'],
  },
  {
    icon: BriefcaseIcon,
    title: 'Employer',
    description: 'Verify candidate academic credentials instantly by Certificate ID, QR code, or bulk CSV upload.',
    path: '/employer/login',
    gradient: 'employer-gradient',
    light: 'bg-purple-50',
    accent: 'text-purple-700',
    border: 'border-purple-100',
    btnClass: 'bg-provexa-purple hover:bg-purple-900',
    features: ['Verify by Certificate ID', 'Verify by QR code scan', 'Bulk CSV verification', 'Raise complaints on forgeries'],
  },
];

const steps = [
  { step: '01', title: 'Institution Issues', desc: 'Institution issues a digitally signed certificate with a unique PRVX ID and QR code.', icon: BuildingLibraryIcon },
  { step: '02', title: 'Student Receives', desc: 'Student logs in to PROVEXA, views and downloads their verified PDF certificate.', icon: AcademicCapIcon },
  { step: '03', title: 'Employer Verifies', desc: 'Employer scans the QR or enters the cert ID — gets instant verified/invalid result.', icon: BriefcaseIcon },
];

function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    const end = parseFloat(target.replace(/[^0-9.]/g, ''));
    if (isNaN(end)) return;

    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress);
      const currentValue = easeProgress * end;

      if (end % 1 === 0) {
        setCount(Math.floor(currentValue));
      } else {
        setCount(currentValue.toFixed(1));
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [hasStarted, target, duration]);

  const parsedCount = typeof count === 'string' ? parseFloat(count) : count;
  const formattedCount = isNaN(parsedCount)
    ? count
    : parsedCount.toLocaleString('en-IN', {
        minimumFractionDigits: target.includes('.') ? 1 : 0,
        maximumFractionDigits: target.includes('.') ? 1 : 0,
      });

  return <span ref={containerRef}>{formattedCount}{suffix}</span>;
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="provexa-gradient text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <CheckBadgeIcon className="w-4 h-4" /> Secure Academic Verification Portal
          </div>
          <div className="flex justify-center mb-6">
            <img src="/logo.jpg" alt="PROVEXA Logo" className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-white/20 shadow-2xl object-cover animate-fade-in" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-tight">
            PROVEXA
          </h1>
          <p className="text-xl sm:text-2xl font-light mt-3 text-blue-100">
            Authenticity Validator for Academia
          </p>
          <p className="text-base text-blue-200 mt-4 max-w-2xl mx-auto leading-relaxed">
            A secure, tamper-proof platform for issuing, verifying, and managing academic certificates.
            Built on SHA-256 cryptographic hashing and QR-based verification.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Link to="/employer/login" className="px-8 py-3 bg-white text-provexa-navy font-bold rounded-xl hover:bg-blue-50 transition-colors">
              Verify a Certificate →
            </Link>
            <Link to="/institution/register" className="px-8 py-3 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:bg-opacity-10 transition-colors">
              Register Institution
            </Link>
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section className="py-16 px-4 bg-provexa-bg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-provexa-navy">Choose Your Portal</h2>
            <p className="text-gray-500 mt-2">Each role has a dedicated, secure login portal</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role) => (
              <div key={role.title} className={`bg-white rounded-2xl card-shadow border ${role.border} p-6 hover:card-shadow-hover transition-all duration-200`}>
                <div className={`inline-flex p-3 rounded-xl ${role.light} mb-4`}>
                  <role.icon className={`w-7 h-7 ${role.accent}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{role.title} Portal</h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{role.description}</p>
                <ul className="space-y-1.5 mb-6">
                  {role.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className={`w-1.5 h-1.5 rounded-full ${role.accent.replace('text-', 'bg-')}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to={role.path} className={`flex items-center justify-center gap-2 w-full py-2.5 ${role.btnClass} text-white font-semibold rounded-xl transition-colors`}>
                  Go to {role.title} Portal <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-provexa-navy mb-2">How PROVEXA Works</h2>
          <p className="text-gray-500 mb-10">Three simple steps to academic credential verification</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                <div className="bg-provexa-bg rounded-2xl p-6 text-center">
                  <span className="text-4xl font-black text-provexa-navy text-opacity-20">{s.step}</span>
                  <div className="flex justify-center my-3">
                    <div className="p-3 bg-white rounded-xl card-shadow">
                      <s.icon className="w-8 h-8 text-provexa-navy" />
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-gray-300 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="provexa-gradient py-12 px-4 text-white">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Certificates Issued', value: '10000', suffix: '+' },
            { label: 'Institutions', value: '200', suffix: '+' },
            { label: 'Verifications', value: '50000', suffix: '+' },
            { label: 'Success Rate', value: '99.9', suffix: '%' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-3xl sm:text-4xl font-black tracking-tight">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-sm text-blue-200 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
