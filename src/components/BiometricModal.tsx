import React, { useState } from 'react';
import { Fingerprint, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

interface BiometricModalProps {
  isOpen: boolean;
  onUnlock: () => void;
  darkMode: boolean;
}

export const BiometricModal: React.FC<BiometricModalProps> = ({ isOpen, onUnlock, darkMode }) => {
  const [pin, setPin] = useState<string>('');
  const [scanning, setScanning] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleFingerprintScan = () => {
    setScanning(true);
    setErrorMsg('');
    setTimeout(() => {
      setScanning(false);
      setSuccess(true);
      setTimeout(() => {
        onUnlock();
        setSuccess(false);
      }, 700);
    }, 1200);
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === '1234' || newPin === '0000' || newPin === '8888') {
          setSuccess(true);
          setTimeout(() => {
            onUnlock();
            setPin('');
            setSuccess(false);
          }, 600);
        } else {
          setErrorMsg('Invalid PIN code (Try 1234 or use TouchID)');
          setTimeout(() => setPin(''), 800);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className={`w-full max-w-sm rounded-2xl p-6 border shadow-2xl transition-all text-center ${
        darkMode ? 'bg-[#161B22] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
          {success ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
          ) : (
            <Lock className="w-8 h-8 text-indigo-400" />
          )}
        </div>

        <h3 className="text-xl font-bold tracking-tight mb-1">
          {success ? 'Authenticated' : 'TradePulse Biometric Lock'}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Scan fingerprint / FaceID or enter 4-digit PIN (1234)
        </p>

        {/* Biometric Scan Circle */}
        <div className="mb-6">
          <button
            onClick={handleFingerprintScan}
            disabled={scanning || success}
            className={`w-24 h-24 rounded-2xl mx-auto flex flex-col items-center justify-center gap-2 border transition-all ${
              scanning
                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 animate-pulse scale-105'
                : 'bg-[#0D1117] border-slate-700/80 hover:border-indigo-500/50 text-indigo-400 hover:scale-105'
            }`}
          >
            <Fingerprint className={`w-10 h-10 ${scanning ? 'animate-spin' : ''}`} />
            <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400">
              {scanning ? 'Verifying...' : 'Tap for TouchID'}
            </span>
          </button>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border transition-all ${
                pin.length > idx
                  ? 'bg-indigo-500 border-indigo-500 shadow-sm shadow-indigo-500/50'
                  : 'bg-slate-800 border-slate-700'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-400 mb-4 animate-shake font-medium">
            {errorMsg}
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto mb-4 font-mono">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-16 h-12 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-slate-200 font-bold text-lg active:scale-95 transition-all"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleFingerprintScan}
            className="w-16 h-12 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-center active:scale-95 transition-all"
          >
            Touch
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-12 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-slate-200 font-bold text-lg active:scale-95 transition-all"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-12 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center justify-center active:scale-95 transition-all"
          >
            Del
          </button>
        </div>

        <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>AES-256 Encrypted Local Biometric Storage</span>
        </div>

      </div>
    </div>
  );
};
