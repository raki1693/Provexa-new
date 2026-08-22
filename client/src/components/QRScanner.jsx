import { useEffect, useRef, useState } from 'react';
import { CameraIcon, StopIcon } from '@heroicons/react/24/outline';

export default function QRScanner({ onScan }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  const startScan = async () => {
    setError('');
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      html5QrRef.current = new Html5Qrcode('qr-scanner-element');
      await html5QrRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Extract certId from URL if full URL is embedded
          let certId = decodedText;
          if (decodedText.includes('/verify/')) {
            certId = decodedText.split('/verify/').pop().trim();
          }
          onScan(certId);
          stopScan();
        },
        () => {} // ignore per-frame errors
      );
      setScanning(true);
    } catch (err) {
      setError('Camera not available or permission denied. Please allow camera access.');
    }
  };

  const stopScan = async () => {
    try {
      if (html5QrRef.current && scanning) {
        await html5QrRef.current.stop();
        html5QrRef.current = null;
      }
    } catch {}
    setScanning(false);
  };

  useEffect(() => {
    return () => { stopScan(); };
  }, []);

  return (
    <div className="w-full">
      <div id="qr-scanner-element" className={`w-full rounded-xl overflow-hidden ${scanning ? 'block' : 'hidden'}`} style={{ maxWidth: 400, margin: '0 auto' }} />

      {!scanning && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
          <CameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 font-medium">Use camera to scan QR code</p>
          <p className="text-xs text-gray-400 mt-1">Point your camera at the QR on the certificate</p>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-2 text-center">{error}</p>}

      <div className="flex justify-center mt-4">
        {!scanning ? (
          <button onClick={startScan} className="flex items-center gap-2 px-6 py-2.5 bg-provexa-purple text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
            <CameraIcon className="w-5 h-5" /> Start Scanning
          </button>
        ) : (
          <button onClick={stopScan} className="flex items-center gap-2 px-6 py-2.5 bg-gray-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
            <StopIcon className="w-5 h-5" /> Stop Scanning
          </button>
        )}
      </div>
    </div>
  );
}
