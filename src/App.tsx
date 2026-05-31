import React, { useState } from 'react';
import { TaskManager } from './components/TaskManager';
import { Downloader } from './components/Downloader';
import { DownloadsGallery } from './components/DownloadsGallery';
import { SettingsProfile } from './components/Settings';
import { LockScreen } from './components/LockScreen';
import { useAppStore } from './hooks/useAppStore';
import { CheckSquare, DownloadCloud, Library, Settings as SettingsIcon } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ToastProvider } from './components/Toast';

type Tab = 'tasks' | 'download' | 'gallery' | 'settings';

export default function App() {
  const { isLocked, unlock, isLoading } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('tasks');

  if (isLoading) {
    return <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center text-slate-500">جاري التحميل...</div>;
  }

  if (isLocked) {
    return <LockScreen onUnlock={unlock} />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'tasks': return <TaskManager />;
      case 'download': return <Downloader />;
      case 'gallery': return <DownloadsGallery />;
      case 'settings': return <SettingsProfile />;
      default: return <TaskManager />;
    }
  };

  const navItems = [
    { id: 'tasks', label: 'المهام', icon: CheckSquare },
    { id: 'download', label: 'التحميل', icon: DownloadCloud },
    { id: 'gallery', label: 'المكتبة', icon: Library },
    { id: 'settings', label: 'الإعدادات', icon: SettingsIcon },
  ] as const;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#0A0A0B] text-slate-200 font-sans flex flex-col font-medium overflow-x-hidden">
        
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#121214] border-b border-[#232326] h-16 flex items-center">
          <div className="max-w-4xl w-full mx-auto px-6 h-full flex items-center justify-between">
            <h1 className="text-xl font-bold text-blue-500 flex items-center gap-3">
              <span className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 animate-pulse"></span>
              A-L downloader
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-[#1E1E21] px-3 py-1.5 rounded border border-white/5">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-[10px] text-slate-400 italic">متصل</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-4xl mx-auto p-4 pb-24 md:pb-32 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="w-full text-center py-4 mb-20 md:mb-24 text-slate-600 text-xs tracking-wider">
          مع تحيات المطور Amir Lamay
        </footer>

        {/* Bottom Navigation (Mobile) & Floating Sidebar (Desktop) */}
        <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#121214] border-t border-[#232326] md:bottom-6 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:border md:rounded-xl pb-safe">
        <div className="flex items-center justify-around md:justify-center md:gap-2 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2 px-4 md:px-6 md:py-3 transition-colors relative flex-1 md:flex-none",
                  isActive 
                    ? "text-blue-400" 
                    : "text-slate-500 hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-tab"
                    className="absolute inset-0 bg-blue-600/10 border-t-2 border-blue-500 md:border-t-0 md:rounded md:border-b-2"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon size={20} className="relative z-10" />
                <span className="text-[11px] md:text-sm font-semibold relative z-10">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      </div>
    </ToastProvider>
  );
}
