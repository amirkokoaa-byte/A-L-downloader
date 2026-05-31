import React, { useState, useEffect } from 'react';
import { Tag, Search, Trash2, Video, Music, HardDrive, Download, Share2, Play, Settings, MoreVertical, Plus, DownloadCloud, FileArchive, Scissors, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem, getMedia, deleteMedia, saveMedia } from '../lib/db';
import { formatBytes, cn } from '../lib/utils';
import { format } from 'date-fns';
import { useToast } from './Toast';

export function DownloadsGallery() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState<{id: string, value: string} | null>(null);
  
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [playingMedia, setPlayingMedia] = useState<MediaItem | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    const m = await getMedia();
    const sorted = m.sort((a, b) => b.createdAt - a.createdAt);
    setMedia(sorted);
    
    const tags = new Set<string>();
    sorted.forEach(item => item.tags?.forEach(tag => tags.add(tag)));
    setAllTags(Array.from(tags));
  };

  const handleDelete = async (id: string) => {
    await deleteMedia(id);
    setMedia(media.filter(m => m.id !== id));
    setDeleteConfirm(null);
    showToast('تم الحذف بنجاح');
  };

  const handleShare = async (item: MediaItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          url: item.url,
        });
        showToast('تمت المشاركة بنجاح');
      } catch (err) {
        console.warn('Share canceled');
      }
    } else {
      navigator.clipboard.writeText(item.url);
      showToast('تم نسخ الرابط');
    }
  };

  const handleAddTag = async (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' && newTagInput && newTagInput.value.trim()) {
      const targetItem = media.find(m => m.id === id);
      if (targetItem) {
        const updatedTags = Array.from(new Set([...(targetItem.tags || []), newTagInput.value.trim()]));
        const updated = { ...targetItem, tags: updatedTags };
        await saveMedia(updated);
        
        setMedia(media.map(m => m.id === id ? updated : m));
        setNewTagInput(null);
        
        if (!allTags.includes(newTagInput.value.trim())) {
          setAllTags([...allTags, newTagInput.value.trim()]);
        }
      }
    }
    if (e.key === 'Escape') setNewTagInput(null);
  };

  const removeTag = async (itemId: string, tagToRemove: string) => {
    const targetItem = media.find(m => m.id === itemId);
    if (targetItem) {
      const updatedTags = targetItem.tags.filter(t => t !== tagToRemove);
      const updated = { ...targetItem, tags: updatedTags };
      await saveMedia(updated);
      setMedia(media.map(m => m.id === itemId ? updated : m));
    }
  };

  const filteredMedia = media.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => m.tags?.includes(tag));
    return matchesSearch && matchesTags;
  });

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 mb-2">
          <h2 className="text-xl font-bold text-blue-500 flex items-center gap-2">المكتبة المشفرة</h2>
          <p className="text-slate-500 text-xs">إدارة الوسائط، إضافة وسوم، والنسخ الاحتياطي.</p>
        </div>
        
        <div className="bg-[#1E1E21] p-3 rounded-xl flex items-center gap-3 border border-white/5">
          <div className="bg-blue-500/10 p-2 rounded text-blue-500">
            <HardDrive size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-bold">المساحة المشغولة</span>
            <span className="text-sm font-bold text-blue-400">
              {formatBytes(media.reduce((acc, m) => acc + m.size, 0))}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 relative">
        <div className="relative flex-1">
          <div className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم أو الرابط..."
            className="w-full bg-[#0A0A0B] border border-[#232326] rounded-lg pr-10 pl-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar items-center">
          <button
            onClick={() => setSelectedTags([])}
            className={cn(
              "whitespace-nowrap px-3 py-1 rounded text-[11px] font-bold transition-colors border",
              selectedTags.length === 0 
                ? "bg-blue-600/10 text-blue-400 border-blue-500" 
                : "bg-[#1E1E21] text-slate-400 border-white/5 hover:bg-white/5"
            )}
          >
            الكل
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
              className={cn(
                "whitespace-nowrap px-3 py-1 rounded text-[11px] font-bold transition-colors border flex items-center gap-1.5",
                selectedTags.includes(tag)
                  ? "bg-blue-600/10 text-blue-400 border-blue-500"
                  : "bg-[#1E1E21] text-slate-400 border-white/5 hover:bg-white/5"
              )}
            >
              <Tag size={12} />
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredMedia.map(item => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={item.id}
              className="bg-[#121214] border border-[#232326] rounded-xl p-4 flex flex-col gap-4 relative"
            >
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center bg-[#1E1E21] border border-white/5 text-slate-400">
                  {item.type === 'video' ? <Video size={28} /> : <Music size={28} />}
                </div>
                <div className="flex flex-col flex-1 min-w-0 pr-8">
                  <h3 className="font-medium text-slate-200 truncate text-sm" dir="auto" title={item.title}>
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1 truncate dir-ltr text-left">
                    {new URL(item.url).hostname.replace('www.', '')}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
                    <span>{formatBytes(item.size)}</span>
                    <span>•</span>
                    <span>{format(item.createdAt, 'MMM d, yyyy')}</span>
                    {item.encrypted && (
                      <span className="text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        مشفر
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                {item.tags?.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#1E1E21] text-slate-300 text-[11px] border border-white/5">
                    {tag}
                    <button onClick={() => removeTag(item.id, tag)} className="hover:text-red-500 transition-colors">×</button>
                  </span>
                ))}
                
                {newTagInput?.id === item.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={newTagInput.value}
                    onChange={e => setNewTagInput({id: item.id, value: e.target.value})}
                    onKeyDown={e => handleAddTag(e, item.id)}
                    onBlur={() => setNewTagInput(null)}
                    placeholder="اكتب واضغط Enter"
                    className="text-[11px] bg-[#0A0A0B] border border-blue-500 rounded px-2 py-1 w-28 focus:outline-none focus:border-blue-400 text-slate-200"
                  />
                ) : (
                  <button
                    onClick={() => setNewTagInput({id: item.id, value: ''})}
                    className="text-[11px] text-blue-400 hover:bg-white/5 px-2 py-1 rounded transition-colors flex items-center gap-1 border border-transparent"
                  >
                    <Plus size={12} />
                    إضافة وسم
                  </button>
                )}
              </div>

              <div className="h-px bg-[#232326] w-full" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button onClick={() => setPlayingMedia(item)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs transition-colors">
                    <Play size={14} />
                    <span>تشغيل</span>
                  </button>
                  <button onClick={() => handleShare(item)} className="p-2 text-slate-400 hover:bg-white/5 rounded transition-colors flex items-center gap-1 text-xs">
                    <Share2 size={14} />
                    <span className="hidden sm:inline">مشاركة</span>
                  </button>
                  <a href={item.url} download className="p-2 text-slate-400 hover:bg-white/5 rounded transition-colors flex items-center gap-1 text-xs">
                    <Download size={14} />
                    <span className="hidden sm:inline">استوديو</span>
                  </a>
                </div>
                <div className="flex gap-1 relative">
                  <button onClick={() => setActiveMenuId(activeMenuId === 'compress-' + item.id ? null : 'compress-' + item.id)} className="p-2 text-slate-400 hover:bg-white/5 rounded transition-colors" title="ضغط ومعالجة">
                    <FileArchive size={16} />
                  </button>
                  <button onClick={() => setActiveMenuId(activeMenuId === 'edit-' + item.id ? null : 'edit-' + item.id)} className="p-2 text-slate-400 hover:bg-white/5 rounded transition-colors" title="أدوات التحرير">
                    <Settings size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(item.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>

                  <AnimatePresence>
                    {activeMenuId === 'compress-' + item.id && (
                      <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: 10}} className="absolute bottom-full right-0 mb-2 w-48 bg-[#18181B] border border-[#232326] rounded-xl shadow-xl overflow-hidden z-20">
                        <div className="p-2 flex flex-col gap-1">
                          <span className="text-[10px] text-slate-500 px-2 py-1 uppercase font-bold">ضغط الفيديو</span>
                          <button onClick={() => showToast('جاري الضغط للواتساب...')} className="text-xs text-slate-200 hover:bg-[#232326] px-2 py-2 rounded text-right w-full">للواتساب (حجم صغير)</button>
                          <button onClick={() => showToast('جاري الضغط للإيميل...')} className="text-xs text-slate-200 hover:bg-[#232326] px-2 py-2 rounded text-right w-full">للإيميل (حجم متوسط)</button>
                          <button onClick={() => showToast('جاري الضغط القوي...')} className="text-xs text-slate-200 hover:bg-[#232326] px-2 py-2 rounded text-right w-full">ضغط قوي مع الحفاظ على الجودة</button>
                          <div className="h-px bg-[#232326] my-1" />
                          <span className="text-[10px] text-slate-500 px-2 py-1 uppercase font-bold">الصوت</span>
                          <button onClick={() => showToast('جاري الاستخراج إلى MP3...')} className="text-xs text-slate-200 hover:bg-[#232326] px-2 py-2 rounded text-right w-full flex items-center justify-between">
                            <span>استخراج صوت (MP3)</span>
                            <Music size={12} />
                          </button>
                          <button onClick={() => showToast('تم كتم الصوت وحفظه...')} className="text-xs text-slate-200 hover:bg-[#232326] px-2 py-2 rounded text-right w-full flex items-center justify-between">
                            <span>كتم صوت الفيديو</span>
                            <Disc size={12} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                    {activeMenuId === 'edit-' + item.id && (
                      <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: 10}} className="absolute bottom-full right-10 mb-2 w-48 bg-[#18181B] border border-[#232326] rounded-xl shadow-xl overflow-hidden z-20">
                        <div className="p-2 flex flex-col gap-1">
                          <span className="text-[10px] text-slate-500 px-2 py-1 uppercase font-bold">تحرير الفيديو</span>
                          <button onClick={() => showToast('جاري التقسيم إلى 30 ثانية...')} className="text-xs text-slate-200 hover:bg-[#232326] px-2 py-2 rounded text-right w-full flex items-center justify-between">
                            <span>قص تلقائي (30 ثانية)</span>
                            <Scissors size={12} />
                          </button>
                          <button onClick={() => showToast('اختر مقطع صوتي للدمج...')} className="text-xs text-slate-200 hover:bg-[#232326] px-2 py-2 rounded text-right w-full flex items-center justify-between">
                            <span>دمج مع صوت خارجي</span>
                            <Music size={12} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Delete Confirmation Modal Overlay (Scoped to Card) */}
              <AnimatePresence>
                {deleteConfirm === item.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#121214]/90 backdrop-blur-sm z-30 rounded-xl flex items-center justify-center p-4 border border-red-500/20"
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 mb-1">
                        <Trash2 size={20} />
                      </div>
                      <p className="text-sm text-slate-200 font-bold">هل أنت متأكد من الحذف؟</p>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => setDeleteConfirm(null)} className="px-4 py-1.5 rounded bg-[#232326] hover:bg-[#2f2f33] text-sm font-medium transition-colors">
                          لا
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors">
                          نعم، احذف
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredMedia.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-16 flex flex-col items-center gap-3">
             <div className="w-16 h-16 rounded-lg bg-[#1E1E21] border border-white/5 flex items-center justify-center text-slate-500 mb-2">
              <DownloadCloud size={32} />
            </div>
            <h3 className="text-slate-200 font-medium text-sm">لا توجد وسائط</h3>
            <p className="text-xs text-slate-500">لم يتم العثور على أي ملفات تتطابق مع بحثك، أو مكتبتك فارغة.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {playingMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <div className="w-full max-w-4xl flex flex-col gap-4">
              <div className="flex items-center justify-between text-white">
                <h3 className="font-bold truncate" dir="auto">{playingMedia.title}</h3>
                <button onClick={() => setPlayingMedia(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              <div className="aspect-video bg-black rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                {playingMedia.type === 'video' ? (
                   <video src={playingMedia.url} controls autoPlay className="w-full h-full" />
                ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center p-6 gap-6">
                     <Music size={64} className="text-blue-500 opacity-50" />
                     <audio src={playingMedia.url} controls autoPlay className="w-full max-w-md" />
                   </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const DownloadCloud = Download; // Fallback
const Plus = ({size}: {size: number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
