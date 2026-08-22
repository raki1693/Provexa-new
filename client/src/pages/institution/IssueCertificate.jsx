import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const CERT_TYPES = ['Degree', 'Marksheet', 'Migration', 'Achievement', 'Other'];

export default function IssueCertificate() {
  const navigate = useNavigate();
  const initialFormState = { studentEmail: '', studentName: '', rollNumber: '', course: '', degree: '', specialization: '', grade: '', percentage: '', certType: 'Degree', issueDate: '', expiryDate: '' };
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [issued, setIssued] = useState(null);
  
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleClear = () => {
    setForm(initialFormState);
    setIssued(null);
    toast.success('Form cleared');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/institution/certificates/issue', form);
      setIssued(res.data.data);
      toast.success('Certificate issued successfully!');
      setForm(initialFormState);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeftIcon className="w-4 h-4" /> Back
      </button>

      <h2 className="text-2xl font-bold text-gray-800 mb-1">Issue Certificate</h2>
      <p className="text-sm text-gray-500 mb-6">Issue a digitally signed academic certificate to a student</p>

      {issued && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="font-semibold text-green-800">✅ Certificate Issued Successfully!</p>
          <p className="text-sm text-green-700 mt-1">Certificate ID: <span className="font-mono font-bold">{issued.certId}</span></p>
          <p className="text-xs text-green-600 mt-1">The student has been notified by email.</p>
        </div>
      )}

      <div className="bg-white rounded-2xl card-shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Email *</label>
              <input type="email" className="input-field focus:ring-provexa-green" value={form.studentEmail} onChange={set('studentEmail')} placeholder="student@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
              <input className="input-field focus:ring-provexa-green" value={form.studentName} onChange={set('studentName')} placeholder="e.g. John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
              <input className="input-field focus:ring-provexa-green" value={form.rollNumber} onChange={set('rollNumber')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Name *</label>
              <input className="input-field focus:ring-provexa-green" value={form.course} onChange={set('course')} placeholder="Computer Science" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
              <input className="input-field focus:ring-provexa-green" value={form.degree} onChange={set('degree')} placeholder="B.Tech / M.Sc / B.A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <input className="input-field focus:ring-provexa-green" value={form.specialization} onChange={set('specialization')} placeholder="AI & ML / Finance" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Type *</label>
              <select className="input-field focus:ring-provexa-green" value={form.certType} onChange={set('certType')} required>
                {CERT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
              <input className="input-field focus:ring-provexa-green" value={form.grade} onChange={set('grade')} placeholder="A+ / First Class" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Percentage</label>
              <input type="number" min="0" max="100" className="input-field focus:ring-provexa-green" value={form.percentage} onChange={set('percentage')} placeholder="85.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date *</label>
              <input type="date" className="input-field focus:ring-provexa-green" value={form.issueDate} onChange={set('issueDate')} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (optional)</label>
              <input type="date" className="input-field focus:ring-provexa-green" value={form.expiryDate} onChange={set('expiryDate')} />
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleClear} className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm bg-white font-medium hover:bg-gray-50 transition-colors">
              Clear Fields
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary bg-provexa-green hover:bg-green-800">
              {loading ? 'Issuing...' : 'Issue Certificate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
