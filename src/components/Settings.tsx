import React, { useState } from 'react';
import { Moon, Sun, Lock, Cloud, HardDrive, Trash2, Bell, DownloadCloud } from 'lucide-react';
import { useAppStore } from '../hooks/useAppStore';
import { clearAllMedia } from '../lib/db';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export function SettingsProfile() {
  const { settings, updateSettings } = useAppStore();
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState('');

  const handleClearCache = async () => {
    if(window.confirm('هل أنت متأكد من مسح جميع الملفات المؤقتة والوسائط المحملة؟ هذا الإجراء لا يمكن التراجع عنه.')){
      await clearAllMedia();
      alert('تم مسح الذاكرة بنجاح');
      window.location.reload();
    }
  };

  const handleToggleLock = () => {
    if (settings.lockEnabled) {
      updateSettings({ lockEnabled: false, passcode: null });
      setShowPinSetup(false);
    } else {
      setShowPinSetup(true);
    }
  };

  const savePin = () => {
    if (newPin.length === 4) {
      updateSettings({ lockEnabled: true, passcode: newPin });
      setShowPinSetup(false);
      setNewPin('');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-xl font-bold text-blue-500 flex items-center gap-2">الإعدادات</h2>
        <p className="text-slate-500 text-xs">تخصيص الخصوصية، المظهر، والمزامنة السحابية.</p>
      </div>

      <div className="flex flex-col gap-3">
        {/* Appearance */}
        <section className="bg-[#121214] border border-[#232326] rounded-xl overflow-hidden mb-3">
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#1E1E21] border border-white/5 rounded text-slate-400">
                {settings.darkMode ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-slate-200 text-sm">الوضع المظلم</span>
                <span className="text-[10px] text-slate-500 mt-0.5">تبديل مظهر التطبيق لراحة العين</span>
              </div>
            </div>
            <Toggle 
              checked={settings.darkMode} 
              onChange={(e) => updateSettings({ darkMode: e.target.checked })} 
            />
          </div>
        </section>

        {/* Security / Lock */}
        <section className="bg-[#121214] border border-[#232326] rounded-xl overflow-hidden mb-3">
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#1E1E21] border border-white/5 rounded text-slate-400">
                <Lock size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-slate-200 text-sm">قفل التطبيق (بصمة / رمز)</span>
                <span className="text-[10px] text-slate-500 mt-0.5">حماية التطبيق برمز مرور 4 أرقام</span>
              </div>
            </div>
            <Toggle 
              checked={settings.lockEnabled} 
              onChange={handleToggleLock} 
            />
          </div>

          {showPinSetup && !settings.lockEnabled && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-5 pb-5 pt-2 border-t border-[#232326] bg-[#1E1E21]">
               <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">تعيين رمز مرور جديد</label>
               <div className="flex gap-2">
                 <input
                   type="password"
                   maxLength={4}
                   value={newPin}
                   onChange={e => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                   placeholder="****"
                   className="flex-1 bg-[#0A0A0B] border border-[#232326] rounded px-4 py-2 text-center tracking-widest font-mono text-lg focus:outline-none focus:border-blue-500 text-slate-200"
                 />
                 <button 
                  onClick={savePin}
                  disabled={newPin.length !== 4}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm rounded shadow-lg shadow-blue-500/10 transition-colors"
                 >
                   حفظ
                 </button>
               </div>
            </motion.div>
          )}
        </section>

        {/* Notifications */}
        <section className="bg-[#121214] border border-[#232326] rounded-xl overflow-hidden mb-3">
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#1E1E21] border border-white/5 rounded text-slate-400">
                <Bell size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-slate-200 text-sm">تنبيهات مخصصة</span>
                <span className="text-[10px] text-slate-500 mt-0.5">إشعارات عند اكتمال التحميل أو النسخ</span>
              </div>
            </div>
            <Toggle 
              checked={settings.notificationsEnabled} 
              onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })} 
            />
          </div>
        </section>

        {/* Cloud Sync */}
        <section className="bg-[#121214] border border-[#232326] rounded-xl overflow-hidden mb-3">
          <div className="px-5 py-4 flex items-center justify-between border-b border-[#232326]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded text-blue-500">
                <Cloud size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-slate-200 text-sm">المزامنة السحابية</span>
                <span className="text-[10px] text-blue-500 mt-0.5 font-medium">النسخ الاحتياطي التلقائي قيد الانتظار</span>
              </div>
            </div>
            <button className="text-xs bg-[#1E1E21] border border-white/5 text-slate-300 px-3 py-1.5 rounded hover:bg-white/5 transition-colors">
              ربط الحساب
            </button>
          </div>
        </section>

        {/* Storage */}
        <section className="bg-[#121214] border border-red-500/30 rounded-xl overflow-hidden mb-3">
          <div className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded text-red-500">
                <Trash2 size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-red-400 text-sm">إدارة مساحة التخزين</span>
                <span className="text-[10px] text-red-500/70 mt-0.5">مسح جميع الملفات المؤقتة والوسائط المحملة</span>
              </div>
            </div>
            <button 
              onClick={handleClearCache}
              className="text-xs bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded font-bold transition-colors whitespace-nowrap"
            >
              التفريغ الآن
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}

// Simple Toggle Component
function Toggle({ checked, onChange }: { checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-11 h-6 bg-[#232326] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:-translate-x-0 rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:right-[2px] rtl:after:left-auto after:bg-slate-200 after:border after:border-[#1E1E21] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  );
}
