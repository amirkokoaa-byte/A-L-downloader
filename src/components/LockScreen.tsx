import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Unlock } from 'lucide-react';
import { cn } from '../lib/utils';

interface LockScreenProps {
  onUnlock: (code: string) => boolean;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeypad = (num: number) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      
      if (newPin.length === 4) {
        // Attempt unlock
        const success = onUnlock(newPin);
        if (!success) {
          setError(true);
          setTimeout(() => setPin(''), 500); // Reset after brief delay
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0B] p-4 text-slate-200">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className={cn("p-4 rounded-lg border border-white/5 transition-colors bg-[#1E1E21]", error ? "text-red-500" : "text-blue-500")}>
            {error ? <Lock size={32} /> : <Unlock size={32} />}
          </div>
          <h1 className="text-xl font-bold text-slate-200">أدخل رمز المرور</h1>
          <p className="text-slate-500 text-xs">التطبيق مقفل لحماية خصوصيتك</p>
        </motion.div>

        {/* PIN Dots */}
        <div className="flex gap-4 mb-4">
          {[0, 1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              animate={error ? { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } } : {}}
              className={cn(
                "w-4 h-4 rounded-full border-2 transition-all",
                pin.length > i 
                  ? (error ? "bg-red-500 border-red-500" : "bg-blue-500 border-blue-500") 
                  : "border-[#232326] bg-transparent"
              )}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeypad(num)}
              className="h-16 rounded-xl bg-[#121214] border border-[#232326] text-xl font-medium hover:bg-[#1E1E21] text-slate-200 transition active:scale-95"
            >
              {num}
            </button>
          ))}
          <div className="col-span-1"></div>
          <button
            onClick={() => handleKeypad(0)}
            className="h-16 rounded-xl bg-[#121214] border border-[#232326] text-xl font-medium hover:bg-[#1E1E21] text-slate-200 transition active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-16 flex items-center justify-center rounded-xl bg-[#121214] border border-[#232326] text-sm uppercase font-bold hover:bg-[#1E1E21] text-slate-500 transition active:scale-95"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}
