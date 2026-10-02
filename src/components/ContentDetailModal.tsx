import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  Sparkles, 
  Plus, 
  Check, 
  Clock, 
  Calendar, 
  Link as LinkIcon, 
  User, 
  Layers, 
  ArrowRight,
  Target,
  BarChart3,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { 
  ContentPlanItem, 
  ContentPillar, 
  ContentFormat, 
  ContentPlatform, 
  ContentGoal, 
  ContentStage, 
  ExecutionStatus, 
  ExecutionTodo, 
  TodoPhase, 
  BrandSettings 
} from '../types/content';
import { 
  formatDateIndo, 
  getPillarBadgeColor, 
  getPlatformBadge, 
  getStageDetails, 
  calculateEngagementRate, 
  triggerConfetti 
} from '../utils/helpers';

interface ContentDetailModalProps {
  content: ContentPlanItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: ContentPlanItem) => void;
  onDelete: (id: string) => void;
  brandSettings: BrandSettings;
}

export const ContentDetailModal: React.FC<ContentDetailModalProps> = ({
  content,
  isOpen,
  onClose,
  onSave,
  onDelete,
  brandSettings,
}) => {
  if (!isOpen || !content) return null;

  const [activeTab, setActiveTab] = useState<'info' | 'todos' | 'eval'>('info');

  // Form Fields
  const [title, setTitle] = useState(content.title);
  const [pillar, setPillar] = useState<ContentPillar>(content.pillar);
  const [format, setFormat] = useState<ContentFormat>(content.format);
  const [platform, setPlatform] = useState<ContentPlatform>(content.platform);
  const [goal, setGoal] = useState<ContentGoal>(content.goal);
  const [targetAudience, setTargetAudience] = useState(content.targetAudience);
  const [scheduledDate, setScheduledDate] = useState(content.scheduledDate);
  const [scheduledTime, setScheduledTime] = useState(content.scheduledTime || '19:00');
  const [hook, setHook] = useState(content.hook);
  const [captionScript, setCaptionScript] = useState(content.captionScript);
  const [callToAction, setCallToAction] = useState(content.callToAction || '');
  const [hashtagsStr, setHashtagsStr] = useState(content.hashtags?.join(' ') || '');
  const [assetLinks, setAssetLinks] = useState(content.assetLinks || '');
  const [stage, setStage] = useState<ContentStage>(content.stage);
  const [status, setStatus] = useState<ExecutionStatus>(content.status);

  // Todos State
  const [todos, setTodos] = useState<ExecutionTodo[]>(content.todos || []);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoPhase, setNewTodoPhase] = useState<TodoPhase>('Produksi Visual');
  const [newTodoPic, setNewTodoPic] = useState(brandSettings.teamMembers[0]?.name || 'Creator');
  const [newTodoDate, setNewTodoDate] = useState('');

  // AI Hook Regenerate State
  const [isRegeneratingHook, setIsRegeneratingHook] = useState(false);

  const phases: TodoPhase[] = [
    'Riset & Naskah',
    'Produksi Visual',
    'Editing & Aset',
    'Review & Approval',
    'Distribusi & Publish',
  ];

  const handleToggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    const newTodo: ExecutionTodo = {
      id: `td-${Date.now()}`,
      title: newTodoTitle.trim(),
      phase: newTodoPhase,
      pic: newTodoPic,
      completed: false,
      dueDate: newTodoDate || undefined,
    };

    setTodos((prev) => [...prev, newTodo]);
    setNewTodoTitle('');
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  // Generate hook suggestion
  const handleGenerateHook = async () => {
    if (!title.trim()) return;
    setIsRegeneratingHook(true);
    try {
      const response = await fetch('/api/generate-hooks-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          pillar,
          goal,
          format,
          platform,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.hooks && data.hooks.length > 0) {
          setHook(data.hooks[0].text);
          triggerConfetti();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegeneratingHook(false);
    }
  };

  const handleSaveAll = () => {
    const parsedHashtags = hashtagsStr
      .split(' ')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    const updatedItem: ContentPlanItem = {
      ...content,
      title,
      pillar,
      format,
      platform,
      goal,
      targetAudience,
      scheduledDate,
      scheduledTime,
      hook,
      captionScript,
      callToAction,
      hashtags: parsedHashtags,
      assetLinks,
      stage,
      status,
      todos,
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white truncate">
                {title || 'Rencana Konten'}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>Alur Terpadu:</span>
                <span className="font-semibold text-indigo-400">
                  {stage === 'konten' ? '1. Konten Plan' : stage === 'eksekusi' ? '2. Eksekusi Produksi' : '3. Evaluasi Kinerja'}
                </span>
                <span>• Status: <strong className="text-slate-300">{status}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(content.id)}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Hapus Konten Ini"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs inside modal */}
        <div className="px-6 py-2 border-b border-slate-800 bg-slate-950/60 flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-2 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'info'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Perencanaan & Naskah
          </button>
          <button
            onClick={() => setActiveTab('todos')}
            className={`py-2 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'todos'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>2. Checklist Eksekusi To-Do</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
              {todos.filter((t) => t.completed).length}/{todos.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('eval')}
            className={`py-2 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'eval'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Evaluasi & Metrik
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: INFO & NASKAH */}
          {activeTab === 'info' && (
            <div className="space-y-5">
              {/* Stage Transition Selector */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Pindahkan Tahap Alur Konten:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStage('konten');
                      setStatus('Draft');
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                      stage === 'konten'
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    1. Rencana Konten
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStage('eksekusi');
                      setStatus('In Production');
                      triggerConfetti();
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                      stage === 'eksekusi'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    2. Eksekusi Produksi 🚀
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStage('evaluasi');
                      setStatus('Published');
                      triggerConfetti();
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                      stage === 'evaluasi'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    3. Tayang & Evaluasi 📊
                  </button>
                </div>
              </div>

              {/* Title & Goal */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Judul / Topik Utama Konten:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Grid 4 columns for parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">Pilar Konten:</label>
                  <select
                    value={pillar}
                    onChange={(e) => setPillar(e.target.value as ContentPillar)}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Edukasi">Edukasi</option>
                    <option value="Promosi">Promosi</option>
                    <option value="Hiburan">Hiburan</option>
                    <option value="Inspirasi">Inspirasi</option>
                    <option value="Behind the Scenes">Behind the Scenes</option>
                    <option value="Interaksi">Interaksi</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">Platform:</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as ContentPlatform)}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="X / Twitter">X / Twitter</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">Format:</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as ContentFormat)}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Short Video (Reels/TikTok)">Short Video</option>
                    <option value="Carousel">Carousel</option>
                    <option value="Single Post">Single Post</option>
                    <option value="Thread / Teks">Thread / Teks</option>
                    <option value="Long Video / YouTube">Long Video</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">Tujuan Konten:</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as ContentGoal)}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Brand Awareness">Brand Awareness</option>
                    <option value="Engagement & Komunitas">Engagement</option>
                    <option value="Lead Generation">Lead Generation</option>
                    <option value="Penjualan Langsung">Penjualan Langsung</option>
                    <option value="Edukasi Pasar">Edukasi Pasar</option>
                  </select>
                </div>
              </div>

              {/* Target Audience & Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Target Audiens Spesifik:
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Contoh: Pekerja kantoran yang sering lembur dan butuh workout 15 menit..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Jadwal Tayang:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-2/3 px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200"
                    />
                    <input
                      type="text"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      placeholder="19:00"
                      className="w-1/3 px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Hook Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    ⚡ Hook 3 Detik Pertama (Headline):
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateHook}
                    disabled={isRegeneratingHook}
                    className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isRegeneratingHook ? 'Meramu...' : 'Buat Variasi Hook AI'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={hook}
                  onChange={(e) => setHook(e.target.value)}
                  placeholder="Kalimat pembuka pemikat atensi penonton..."
                  className="w-full px-3 py-2 bg-slate-950 border border-amber-500/30 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Caption Script */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Naskah Video / Storyboard / Caption Lengkap:
                </label>
                <textarea
                  rows={6}
                  value={captionScript}
                  onChange={(e) => setCaptionScript(e.target.value)}
                  placeholder="Tuliskan naskah per scene atau copywriting caption lengkap..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
                />
              </div>

              {/* CTA & Hashtags & Assets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Call to Action (CTA):</label>
                  <input
                    type="text"
                    value={callToAction}
                    onChange={(e) => setCallToAction(e.target.value)}
                    placeholder="Contoh: Komen 'INFO' untuk diskon..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Hashtags:</label>
                  <input
                    type="text"
                    value={hashtagsStr}
                    onChange={(e) => setHashtagsStr(e.target.value)}
                    placeholder="#LariPagi #Sportswear #Tips"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Link Aset (Drive/Canva):</label>
                  <input
                    type="text"
                    value={assetLinks}
                    onChange={(e) => setAssetLinks(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TODOS EKSEKUSI */}
          {activeTab === 'todos' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">Checklist To-Do Produksi Konten Ini</h3>
                  <p className="text-xs text-slate-400">Pastikan setiap tahapan riset, syuting, editing, dan review diselesaikan.</p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  {todos.filter((t) => t.completed).length} dari {todos.length} Selesai
                </span>
              </div>

              {/* Add Todo Inline */}
              <form onSubmit={handleAddTodo} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newTodoTitle}
                  onChange={(e) => setNewTodoTitle(e.target.value)}
                  placeholder="Tambah tugas baru (contoh: Syuting B-Roll kain jersey)..."
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
                <select
                  value={newTodoPhase}
                  onChange={(e) => setNewTodoPhase(e.target.value as TodoPhase)}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200"
                >
                  {phases.map((ph) => (
                    <option key={ph} value={ph}>
                      {ph}
                    </option>
                  ))}
                </select>
                <select
                  value={newTodoPic}
                  onChange={(e) => setNewTodoPic(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200"
                >
                  {brandSettings.teamMembers.map((tm) => (
                    <option key={tm.id} value={tm.name}>
                      {tm.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 cursor-pointer shrink-0"
                >
                  + Tambah
                </button>
              </form>

              {/* List */}
              <div className="space-y-2">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => {
                          handleToggleTodo(todo.id);
                          if (!todo.completed) triggerConfetti();
                        }}
                        className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900 cursor-pointer"
                      />
                      <span
                        className={`text-xs font-medium truncate ${
                          todo.completed ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {todo.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400">
                        {todo.phase}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {todo.pic}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: EVALUASI */}
          {activeTab === 'eval' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Target Metrik Awal:
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-900 rounded-lg">
                    <span className="text-slate-500 text-[10px] block">Target Views</span>
                    <span className="font-bold font-mono text-white">
                      {content.evaluation?.targetViews?.toLocaleString('id-ID') || '15.000'}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg">
                    <span className="text-slate-500 text-[10px] block">Target Likes</span>
                    <span className="font-bold font-mono text-white">
                      {content.evaluation?.targetLikes || '900'}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg">
                    <span className="text-slate-500 text-[10px] block">Target Saves</span>
                    <span className="font-bold font-mono text-white">
                      {content.evaluation?.targetSaves || '300'}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg">
                    <span className="text-slate-500 text-[10px] block">Target Shares</span>
                    <span className="font-bold font-mono text-white">
                      {content.evaluation?.targetShares || '100'}
                    </span>
                  </div>
                </div>
              </div>

              {content.evaluation?.actualViews ? (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <span className="text-xs font-bold text-emerald-300">
                    Hasil Aktual: {content.evaluation.actualViews.toLocaleString('id-ID')} Views • Engagement Rate {content.evaluation.engagementRate}%
                  </span>
                  <p className="text-xs text-slate-300">
                    Status: <strong className="text-white">{content.evaluation.verdict}</strong>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Konten belum dipublikasikan atau belum memiliki metrik aktual. Buka tab <strong>Evaluasi Kinerja</strong> di menu utama untuk mencatat hasil realisasi tayang.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
