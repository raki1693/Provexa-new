import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { PhotoIcon, SwatchIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

const templateOptions = [
  { id: 'default', name: 'Classic Navy', primaryColor: '#1B4F72', secondaryColor: '#2E86C1' },
  { id: 'elegant_gold', name: 'Elegant Gold', primaryColor: '#B8860B', secondaryColor: '#D7C460' },
  { id: 'modern_emerald', name: 'Modern Emerald', primaryColor: '#145A32', secondaryColor: '#1E8449' },
  { id: 'royal_ruby', name: 'Royal Ruby', primaryColor: '#641E16', secondaryColor: '#922B21' },
];

export default function CertificateDesign() {
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [signatureFile, setSignatureFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load existing design options
    const fetchDesign = async () => {
      setLoading(true);
      try {
        const res = await api.get('/institution/profile');
        if (res.data.data?.certificateDesign) {
          const design = res.data.data.certificateDesign;
          setSelectedTemplate(design.templateType || 'default');
          if (design.signatureUrl) {
            setPreviewUrl(design.signatureUrl);
          }
        }
      } catch (err) {
        toast.error('Failed to load certificate design configurations');
      } finally {
        setLoading(false);
      }
    };
    fetchDesign();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.mimetype || file.type)) {
        return toast.error('Only PNG or JPG files are allowed');
      }
      if (file.size > 2 * 1024 * 1024) {
        return toast.error('Signature size must be under 2MB');
      }
      setSignatureFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    formData.append('templateType', selectedTemplate);
    if (signatureFile) {
      formData.append('signature', signatureFile);
    }

    try {
      await api.post('/institution/design', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Certificate layout updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update certificate design settings');
    } finally {
      setSaving(false);
    }
  };

  const borderColors = {
    default: '#1B4F72',
    elegant_gold: '#B8860B',
    modern_emerald: '#145A32',
    royal_ruby: '#641E16',
  };

  const secondaryBorderColors = {
    default: '#2E86C1',
    elegant_gold: '#D7C460',
    modern_emerald: '#1E8449',
    royal_ruby: '#922B21',
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Certificate Designer</h1>
          <p className="text-sm text-gray-500">Configure visual layouts and stamp official signatures on issued credentials</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Configurations Form */}
        <div className="lg:col-span-5 bg-white border border-gray-150 rounded-xl p-5 sm:p-6 shadow-sm">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Template Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                <SwatchIcon className="w-4 h-4 text-gray-400" />
                Select Border Template Theme
              </label>
              <div className="grid grid-cols-2 gap-3">
                {templateOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedTemplate(option.id)}
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl text-center transition-all ${
                      selectedTemplate === option.id
                        ? 'border-emerald-600 bg-emerald-50/10'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex gap-1 mb-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: option.primaryColor }} />
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: option.secondaryColor }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-800">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Signature Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                <PhotoIcon className="w-4 h-4 text-gray-400" />
                Dean / Registrar Signature (PNG with transparent background recommended)
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors relative cursor-pointer group">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/jpg"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <ArrowUpTrayIcon className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-emerald-600 transition-colors" />
                <span className="text-xs font-medium text-gray-600 block">
                  {signatureFile ? signatureFile.name : 'Click to Upload Signature Image'}
                </span>
                <span className="text-[10px] text-gray-400 block mt-1">PNG, JPG up to 2MB</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? 'Saving changes...' : 'Save Design Settings'}
            </button>
          </form>
        </div>

        {/* Live Mockup Certificate Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-800">Live Certificate Layout Preview</h2>
            
            {/* Visual Preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-6 flex items-center justify-center">
              <div className="w-full max-w-lg aspect-[1.414/1] bg-white border-[6px] rounded-lg p-6 relative flex flex-col justify-between shadow-md" style={{ borderColor: borderColors[selectedTemplate] }}>
                {/* Secondary inner border */}
                <div className="absolute inset-2.5 border-2 border-dashed rounded" style={{ borderColor: secondaryBorderColors[selectedTemplate] }} />
                
                {/* Certificate Content */}
                <div className="relative z-10 flex flex-col justify-between h-full text-center">
                  <div className="mt-2">
                    <h3 className="text-xs tracking-widest font-black uppercase" style={{ color: borderColors[selectedTemplate] }}>
                      PROVEXA ACADEMIC CERTIFICATE
                    </h3>
                    <p className="text-[9px] text-gray-400 font-medium tracking-wide mt-0.5">AUTHENTICITY VALIDATOR FOR ACADEMIA</p>
                  </div>

                  <div className="my-3">
                    <p className="text-[10px] text-gray-500">This is to certify that</p>
                    <p className="text-base font-bold uppercase tracking-wider my-0.5" style={{ color: borderColors[selectedTemplate] }}>
                      JOHN DOE
                    </p>
                    <p className="text-[9px] text-gray-500">has successfully completed the course in Computer Science</p>
                  </div>

                  <div className="flex justify-between items-end mb-1 px-4">
                    {/* Signature */}
                    <div className="text-left flex flex-col items-center">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Signature" className="h-6 object-contain mb-1 max-w-[80px]" />
                      ) : (
                        <div className="h-6 w-16 border border-dashed border-gray-300 rounded flex items-center justify-center text-[8px] text-gray-400 mb-1">
                          No Signature
                        </div>
                      )}
                      <div className="w-20 border-t border-gray-300 my-0.5" />
                      <span className="text-[8px] text-gray-400">Authorized Signatory</span>
                    </div>

                    {/* QR Code */}
                    <div className="text-right flex flex-col items-center">
                      <div className="w-10 h-10 border border-gray-300 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400 mb-0.5">
                        QR
                      </div>
                      <span className="text-[7px] text-gray-400">Scan to Verify</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              * The live preview renders a stylized HTML approximation. The generated download-ready PDF will match this theme configuration precisely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
