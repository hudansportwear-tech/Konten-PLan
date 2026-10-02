import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Sparkles, 
  Calendar, 
  Target, 
  Layers, 
  FileText,
  Clock
} from 'lucide-react';
import { 
  ContentPlanItem, 
  ContentPillar, 
  ContentFormat, 
  ContentPlatform, 
  ContentGoal, 
  ExecutionTodo, 
  BrandSettings 
} from '../types/content';
import { triggerConfetti } from '../utils/helpers';

interface NewContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContent: (item: ContentPlanItem) => void;
  brandSettings: BrandSettings;
  onOpenAiGenerator: () => void;
}

export const NewContentModal: React.FC<NewContentModalProps> = ({
  isOpen,
  onClose,
  onAddContent,
  brandSettings,
  onOpenAiGenerator,
}) => {
  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [pillar, setPillar] = useState<ContentPillar>('Edukasi');
  const [format, setFormat] = useState<ContentFormat>('Short Video (Reels/TikTok)');
  const [platform, setPlatform] = useState<ContentPlatform>('Instagram');
  const [goal, setGoal] = useState<ContentGoal>('Brand Awareness');
  const [targetAudience, setTargetAudience] = useState(brandSettings.targetAudienceDescription);
  const [scheduledDate, setScheduledDate] = useState(today);
  const [scheduledTime, setScheduledTime] = useState('19:00');
  const [hook, setHook] = useState('');
  const [captionScript, setCaptionScript] = useState('');
  const [callToAction, setCallToAction] = useState('');
  const [hashtagsStr, setHashtagsStr] = useState('#Activewear #Sportswear #Tips');
  const [targetViews, setTargetViews] = useState(15000);
  const [autoGenerateTodos, setAutoGenerateTodos] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let todos: ExecutionTodo[] = [];
    if (autoGenerateTodos) {
      todos = [
        {
          id: `td-${Date.now()}-1`,
          title: 'Riset tren & finalisasi naskah hook 3 detik',
          phase: 'Riset & Naskah',
          pic: brandSettings.teamMembers[0]?.name || 'Scriptwriter',
          completed: false,
          dueDate: scheduledDate,
        },
        {
          id: `td-${Date.now()}-2`,
          title: 'Pengambilan footage visual / syuting B-roll',
          phase: 'Produksi Visual',
          pic: brandSettings.teamMembers[2]?.name || 'Videographer',
          completed: false,
          dueDate: scheduledDate,
        },
        {
          id: `td-${Date.now()}-3`,
          title: 'Editing video, subtitle dinamis, & pemilihan audio',
          phase: 'Editing & Aset',
          pic: brandSettings.teamMembers[2]?.name || 'Video Editor',
          completed: false,
          dueDate: scheduledDate,
        },
        {
          id: `td-${Date.now()}-4`,
          title: 'Proofreading caption & review internal',
          phase: 'Review & Approval',
          pic: brandSettings.teamMembers[3]?.name || 'Social Media',
          completed: false,
          dueDate: scheduledDate,
        },
        {
          id: `td-${Date.now()}-5`,
          title: 'Posting pada jam prima & monitoring 1 jam pertama',
          phase: 'Distribusi & Publish',
          pic: brandSettings.teamMembers[3]?.name || 'Social Media',
          completed: false,
          dueDate: scheduledDate,
        },
      ];
    }

    const parsedHashtags = hashtagsStr
      .split(' ')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    const newItem: ContentPlanItem = {
      id: `cnt-${Date.now()}`,
      title: title.trim(),
      pillar,
      format,
      platform,
      goal,
      targetAudience,
      scheduledDate,
      scheduledTime,
      hook: hook.trim(),
      captionScript: captionScript.trim(),
      callToAction: callToAction.trim(),
      hashtags: parsedHashtags,
      stage: 'konten',
      status: 'Approved',
      todos,
      evaluation: {
        targetViews,
        actualViews: 0,
        targetLikes: Math.round(targetViews * 0.06),
        actualLikes: 0,
        targetSaves: Math.round(targetViews * 0.025),
        actualSaves: 0,
        actualComments: 0,
        actualShares: Math.round(targetViews * 0.01),
        verdict: 'Belum Dievaluasi',
        whatWorked: '',
        whatNeedsImprovement: '',
        nextActionPlan: '',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddContent(newItem);
    triggerConfetti();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-auto">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Buat Rencana Konten Baru</h2>
              <p className="text-xs text-slate-400">Tahap 1: Rumuskan ide, tujuan, pilar, dan to-do eksekusi.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAiGenerator();
              }}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Gunakan AI</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Judul */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Judul / Topik Rencana Konten:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: 3 Alasan Kenapa Otot Gampang Kram Saat Lari & Solusinya"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Grid Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Pilar:</label>
              <select
                value={pillar}
                onChange={(e) => setPillar(e.target.value as ContentPillar)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
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
              <label className="text-[11px] font-semibold text-slate-400">Platform:</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as ContentPlatform)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
              >
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="X / Twitter">X / Twitter</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Format:</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as ContentFormat)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
              >
                <option value="Short Video (Reels/TikTok)">Short Video</option>
                <option value="Carousel">Carousel</option>
                <option value="Single Post">Single Post</option>
                <option value="Thread / Teks">Thread / Teks</option>
                <option value="Long Video / YouTube">Long Video</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Tujuan:</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as ContentGoal)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
              >
                <option value="Brand Awareness">Brand Awareness</option>
                <option value="Engagement & Komunitas">Engagement</option>
                <option value="Lead Generation">Lead Generation</option>
                <option value="Penjualan Langsung">Penjualan Langsung</option>
                <option value="Edukasi Pasar">Edukasi Pasar</option>
              </select>
            </div>
          </div>

          {/* Hook 3 Detik */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-amber-400">
              ⚡ Hook Pembuka 3 Detik:
            </label>
            <input
              type="text"
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder="Contoh: Jangan minum ini sebelum lari kalau gak mau perut melilit!"
              className="w-full px-3 py-2 bg-slate-950 border border-amber-500/30 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Caption & Naskah */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Draft Naskah / Caption:
            </label>
            <textarea
              rows={4}
              value={captionScript}
              onChange={(e) => setCaptionScript(e.target.value)}
              placeholder="Tuliskan poin-poin penjelasan atau draft caption..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Tanggal & Target Views */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Jadwal Tayang:</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-2/3 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200"
                />
                <input
                  type="text"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-1/3 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Target Views:</label>
              <input
                type="number"
                value={targetViews}
                onChange={(e) => setTargetViews(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200"
              />
            </div>
          </div>

          {/* Checkbox auto generate todos */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
            <input
              type="checkbox"
              id="autoTodos"
              checked={autoGenerateTodos}
              onChange={(e) => setAutoGenerateTodos(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-indigo-500 focus:ring-indigo-500 bg-slate-900 cursor-pointer"
            />
            <label htmlFor="autoTodos" className="text-xs text-slate-300 cursor-pointer">
              <strong>Otomatis buat 5 checklist To-Do Eksekusi</strong> (Riset naskah, syuting, editing video, review, & scheduling)
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              Simpan ke Rencana Konten
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
