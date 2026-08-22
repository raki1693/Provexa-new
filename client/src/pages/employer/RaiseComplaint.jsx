import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import UploadZone from '../../components/UploadZone';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function RaiseComplaint() {
  const navigate = useNavigate();
  const [certId, setCertId] = useState('');
  const [reason, setReason] = useState('Forged');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!certId.trim()) return toast.error('Certificate ID is required');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('certId', certId.trim().toUpperCase());
      formData.append('reason', reason);
      formData.append('description', description);
      if (evidence) {
        formData.append('evidence', evidence);
      }

      await api.post('/employer/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Complaint submitted successfully. Admin will review it.');
      navigate('/employer/complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCertId('');
    setReason('Forged');
    setDescription('');
    setEvidence(null);
    toast.success('Form cleared');
  };

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeftIcon className="w-4 h-4" /> Back
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Raise a Complaint</h2>
        <p className="text-sm text-gray-500 mt-1 font-medium">Report fake, forged, or mismatched academic certificates directly to Admin</p>
      </div>

      <div className="bg-white rounded-2xl card-shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Certificate ID *</label>
            <input
              type="text"
              value={certId}
              onChange={e => setCertId(e.target.value.toUpperCase())}
              placeholder="PRVX-XXXXXXXX"
              className="input-field font-mono focus:ring-provexa-purple"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Complaint *</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="input-field focus:ring-provexa-purple"
              required
            >
              <option value="Forged">Forged / Fabricated Document</option>
              <option value="Mismatch">Grade / Data Mismatch</option>
              <option value="Revoked but Claimed Valid">Revoked but Claimed Valid</option>
              <option value="Other">Other Issues</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="Provide details about the mismatch or fraud detected..."
              className="input-field focus:ring-provexa-purple"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Evidence (PDF/Image)</label>
            {evidence ? (
              <div className="p-4 border rounded-xl bg-gray-50 flex items-center justify-between">
                <span className="text-sm text-gray-700 font-semibold">{evidence.name}</span>
                <button type="button" onClick={() => setEvidence(null)} className="text-xs text-red-600 hover:underline">Remove</button>
              </div>
            ) : (
              <UploadZone onFileSelect={setEvidence} accept=".pdf,.jpg,.jpeg,.png" label="Drag and drop PDF or Image evidence" />
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleClear} className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm bg-white font-medium hover:bg-gray-50 transition-colors">
              Clear Fields
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary bg-provexa-purple hover:bg-purple-800"
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
