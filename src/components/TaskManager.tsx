import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, Calendar, Edit2, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, getTasks, saveTask, deleteTask } from '../lib/db';
import { generateId, cn } from '../lib/utils';
import { format } from 'date-fns';
import { useToast } from './Toast';

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const t = await getTasks();
    setTasks(t.sort((a, b) => b.createdAt - a.createdAt));
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const task: Task = {
      id: generateId(),
      title: newTask.trim(),
      completed: false,
      createdAt: Date.now(),
      dueDate: newDate || undefined,
      dueTime: newTime || undefined,
    };

    await saveTask(task);
    setNewTask('');
    setNewDate('');
    setNewTime('');
    setTasks([task, ...tasks]);
    showToast('تمت إضافة المهمة بنجاح');
  };

  const toggleTask = async (task: Task) => {
    const updated = { ...task, completed: !task.completed };
    await saveTask(updated);
    setTasks(tasks.map(t => t.id === task.id ? updated : t));
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    setTasks(tasks.filter(t => t.id !== id));
    showToast('تم حذف المهمة');
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = async (task: Task) => {
    if (!editTitle.trim()) return setEditingId(null);
    const updated = { ...task, title: editTitle.trim() };
    await saveTask(updated);
    setTasks(tasks.map(t => t.id === task.id ? updated : t));
    setEditingId(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-xl font-bold text-blue-500 flex items-center gap-2">
          المهام اليومية
        </h2>
        <p className="text-slate-500 text-xs">نظم وقتك وأنجز مهامك بكفاءة</p>
      </div>

      <form onSubmit={handleAddTask} className="flex flex-col gap-3 p-4 bg-[#121214] border border-[#232326] rounded-xl">
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="أضف مهمة جديدة..."
            className="w-full bg-[#0A0A0B] border border-[#232326] rounded-lg py-3 px-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1 bg-[#0A0A0B] border border-[#232326] rounded-lg px-3 py-2 flex items-center gap-2 focus-within:border-blue-500">
            <Calendar size={14} className="text-slate-500" />
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="bg-transparent w-full text-xs text-slate-300 focus:outline-none [color-scheme:dark]"
            />
          </div>
          <div className="flex-1 bg-[#0A0A0B] border border-[#232326] rounded-lg px-3 py-2 flex items-center gap-2 focus-within:border-blue-500">
            <Clock size={14} className="text-slate-500" />
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="bg-transparent w-full text-xs text-slate-300 focus:outline-none [color-scheme:dark]"
            />
          </div>
          <button
            type="submit"
            disabled={!newTask.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg flex items-center justify-center px-6 font-bold text-xs transition-colors"
          >
            إضافة
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {tasks.map(task => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              key={task.id}
              className={cn(
                "group flex items-center gap-4 bg-[#121214] p-4 rounded-xl border transition-all",
                task.completed ? "border-[#232326]/50 opacity-60" : "border-[#232326]"
              )}
            >
              <button 
                onClick={() => toggleTask(task)}
                className={cn(
                  "flex-shrink-0 w-5 h-5 rounded flex items-center justify-center border transition-colors",
                  task.completed ? "bg-green-500/20 border-green-500 text-green-500" : "border-[#232326] bg-[#0A0A0B] text-transparent hover:border-blue-500"
                )}
              >
                <Check size={14} />
              </button>
              
              <div className="flex flex-col flex-1 min-w-0">
                {editingId === task.id ? (
                  <form onSubmit={(e) => { e.preventDefault(); saveEdit(task); }} className="flex gap-2">
                     <input
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 bg-[#0A0A0B] border border-blue-500 rounded px-2 py-1 text-sm text-slate-200 outline-none"
                      />
                     <button type="button" onClick={() => setEditingId(null)} className="text-slate-400 hover:text-white p-1">
                       <X size={16} />
                     </button>
                     <button type="submit" className="text-green-500 hover:text-green-400 p-1">
                       <Check size={16} />
                     </button>
                  </form>
                ) : (
                  <>
                    <span className={cn(
                      "text-sm font-medium transition-all truncate",
                      task.completed ? "line-through text-slate-500" : "text-slate-200"
                    )}>
                      {task.title}
                    </span>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar size={10} />
                        <span>{task.dueDate || format(task.createdAt, 'MMM d')}</span>
                      </div>
                      {task.dueTime && (
                        <div className="flex items-center gap-1 text-blue-400/80">
                          <Clock size={10} />
                          <span>{task.dueTime}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {editingId !== task.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEditing(task)}
                    className="p-2 text-slate-400 hover:bg-white/5 rounded transition-colors focus:opacity-100"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors focus:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {tasks.length === 0 && (
          <div className="text-center py-12 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-lg bg-[#1E1E21] border border-white/5 flex items-center justify-center text-slate-500">
              <Check size={32} />
            </div>
            <p className="text-sm text-slate-500">لا توجد مهام حالياً.</p>
          </div>
        )}
      </div>
    </div>
  );
}
