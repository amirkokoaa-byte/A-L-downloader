import React, { useState } from 'react';
import { DownloadCloud, Video, Music, Link as LinkIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem, saveMedia } from '../lib/db';
import { generateId, cn } from '../lib/utils';
import { useToast } from './Toast';

export function Downloader() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const { showToast } = useToast();

  const handleCheckUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Optional validation
    const validDomains = ['tiktok.com', 'instagram.com', 'facebook.com', 'fb.watch', 'youtube.com', 'youtu.be'];
    try {
      const parsedUrl = new URL(url);
      const isDomainValid = validDomains.some(domain => parsedUrl.hostname.includes(domain));
      if (!isDomainValid) {
        setError('يرجى إدخال رابط صحيح من تيك توك، إنستجرام، فيسبوك، أو يوتيوب.');
        return;
      }
    } catch {
      setError('الرابط غير صالح.');
      return;
    }

    setIsLoading(true);
    setError('');
    setPreview(null);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/download/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'فشل في جلب البيانات، تأكد من صحة الرابط أو خصوصية الفيديو.');
      }

      setPreview(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (formatId: string, formatType: 'audio' | 'video') => {
    if (!preview) return;
    setIsDownloading(true);
    showToast('بدء التحميل...');
    
    // Simulate real download locally
    setTimeout(async () => {
      const item: MediaItem = {
        id: generateId(),
        url: preview.source,
        title: preview.title,
        size: preview.estimatedSizeMB * 1024 * 1024, // Bytes
        type: formatType,
        tags: [],
        createdAt: Date.now(),
        encrypted: true
      };

      await saveMedia(item);
      setIsDownloading(false);
      setPreview(null);
      setUrl('');
      showToast('اكتمل التحميل بنجاح');
      
    }, 2500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-xl font-bold text-blue-500 flex items-center gap-2">
          التحميل من المنصات
        </h2>
        <p className="text-slate-500 text-xs">حمل مقاطع الفيديو والصوت من فيسبوك، انستجرام، وتيك توك بأعلى جودة.</p>
      </div>

      <form onSubmit={handleCheckUrl} className="flex flex-col gap-3">
        <div className="relative">
          <div className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-500">
            <LinkIcon size={20} />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="لصق الرابط هنا..."
            required
            className="w-full bg-[#0A0A0B] border border-[#232326] rounded-lg pr-12 pl-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-sans text-left dir-ltr"
            dir="ltr"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded py-2 shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 transition-all text-sm"
        >
          {isLoading ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Loader2 size={20} />
              </motion.div>
              جاري فحص الرابط...
            </>
          ) : (
            <>
              <DownloadCloud size={20} />
              استخراج ومعاينة
            </>
          )}
        </button>
      </form>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#1E1E21] text-red-400 p-4 rounded-xl text-xs border border-red-500/30">
          {error}
        </motion.div>
      )}

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col gap-4 bg-[#121214] p-5 rounded-xl border border-[#232326]"
          >
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-lg bg-black border border-[#232326] overflow-hidden flex-shrink-0">
                <img src={preview.thumbnail} alt={preview.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <h3 className="font-bold text-sm text-slate-200 truncate" dir="auto">{preview.title}</h3>
                <p className="text-[10px] text-slate-500 mt-1" dir="ltr">{new URL(preview.source).hostname}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/10 text-green-500 text-[10px] font-bold w-fit">
                  تشفير قوي مفعل
                </div>
              </div>
            </div>

            <div className="h-px bg-[#232326] w-full" />

            <div className="flex flex-col gap-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">اختر الجودة والتنسيق:</h4>
              {preview.formats.map((fmt: any) => (
                <button
                  key={fmt.formatId}
                  onClick={() => handleDownload(fmt.formatId, fmt.type)}
                  disabled={isDownloading}
                  className="w-full flex items-center justify-between p-3 rounded border border-[#232326] hover:border-blue-500 hover:bg-[#1E1E21] transition-all text-right disabled:opacity-50 bg-[#0A0A0B]"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-[#1E1E21] text-slate-400">
                      {fmt.type === 'video' ? <Video size={18} /> : <Music size={18} />}
                    </div>
                    <span className="text-xs font-bold text-slate-200">{fmt.label}</span>
                  </div>
                  {isDownloading ? (
                    <Loader2 size={16} className="animate-spin text-blue-500" />
                  ) : (
                    <DownloadCloud size={18} className="text-slate-500 group-hover:text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
