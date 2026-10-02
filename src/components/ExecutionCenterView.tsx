import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  ExternalLink,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { 
  ContentPlanItem, 
  ExecutionTodo, 
  TodoPhase, 
  BrandSettings, 
  ContentStage 
} from '../types/content';
import { 
  formatDateIndo, 
  getPillarBadgeColor, 
  getPlatformBadge, 
  triggerConfetti 
} from '../utils/helpers';

interface ExecutionCenterViewProps {
  contentList: ContentPlanItem[];
  brandSettings: BrandSettings;
  onToggleTodo: (contentId: string, todoId: string) => void;
  onAddTodoToContent: (contentId: string, todo: Omit<ExecutionTodo, 'id'>) => void;
  onUpdateStage: (contentId: string, stage: ContentStage) => void;
  onOpenContentDetail: (content: ContentPlanItem) => void;
}

export const ExecutionCenterView: React.FC<ExecutionCenterViewProps> = ({
  contentList,
  brandSettings,
  onToggleTodo,
  onAddTodoToContent,
  onUpdateStage,
  onOpenContentDetail,
}) => {
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [selectedPic, setSelectedPic] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [selectedContentId, setSelectedContentId] = useState<string>('all');

  // Quick Add To-Do State
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [targetContentId, setTargetContentId] = useState<string>(contentList[0]?.id || '');
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoPhase, setNewTodoPhase] = useState<TodoPhase>('Produksi Visual');
  const [newTodoPic, setNewTodoPic] = useState(brandSettings.teamMembers[0]?.name || 'Content Creator');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');

  // Flatten all todos with content metadata
  const allTodos = contentList.flatMap((content) =>
    content.todos.map((todo) => ({
      ...todo,
      contentId: content.id,
      contentTitle: content.title,
      contentPillar: content.pillar,
      contentPlatform: content.platform,
      contentStage: content.stage,
      scheduledDate: content.scheduledDate,
    }))
  );

  // Filtered todos
  const filteredTodos = allTodos.filter((todo) => {
    const matchesPhase = selectedPhase === 'all' || todo.phase === selectedPhase;
    const matchesPic = selectedPic === 'all' || todo.pic === selectedPic;
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'pending'
        ? !todo.completed
        : todo.completed;
    const matchesContent = selectedContentId === 'all' || todo.contentId === selectedContentId;

    return matchesPhase && matchesPic && matchesStatus && matchesContent;
  });

  const phases: TodoPhase[] = [
    'Riset & Naskah',
    'Produksi Visual',
    'Editing & Aset',
    'Review & Approval',
    'Distribusi & Publish',
  ];

  // Contents in execution or planning stage
  const activeContents = contentList.filter((c) => c.stage !== 'evaluasi');

  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim() || !targetContentId) return;

    onAddTodoToContent(targetContentId, {
      title: newTodoTitle.trim(),
      phase: newTodoPhase,
      pic: newTodoPic,
      completed: false,
      dueDate: newTodoDueDate || undefined,
    });

    setNewTodoTitle('');
    setIsAddingTodo(false);
    triggerConfetti();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border border-amber-500/20 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
              <CheckSquare className="w-3.5 h-3.5" />
              Tahap 2: Pusat Eksekusi & Manajemen Tugas Produksi
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              To-Do List Eksekusi Konten Terpadu
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Semua checklist produksi dari seluruh rencana konten terorganisir di sini. Pantau progres riset naskah, syuting video, editing aset, hingga tahap final approval & jadwal publish.
            </p>
          </div>

          <button
            onClick={() => setIsAddingTodo(true)}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah To-Do Eksekusi</span>
          </button>
        </div>
      </div>

      {/* Production Progress by Content Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            Status Produksi per Konten ({activeContents.length} Konten Berjalan)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeContents.map((content) => {
            const completed = content.todos.filter((t) => t.completed).length;
            const total = content.todos.length;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
            const pillarColor = getPillarBadgeColor(content.pillar);
            const isAllDone = total > 0 && completed === total;

            return (
              <div
                key={content.id}
                className={`p-4 rounded-xl bg-slate-900/80 border transition-all ${
                  isAllDone
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                } flex flex-col justify-between space-y-3`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] mb-1.5">
                    <span className={`px-2 py-0.5 rounded-full border ${pillarColor.bg} ${pillarColor.text} ${pillarColor.border}`}>
                      {content.pillar}
                    </span>
                    <span className="text-slate-400 font-mono">
                      Jadwal: {formatDateIndo(content.scheduledDate)}
                    </span>
                  </div>
                  <h4 
                    onClick={() => onOpenContentDetail(content)}
                    className="text-sm font-bold text-slate-100 hover:text-indigo-300 transition-colors line-clamp-1 cursor-pointer"
                  >
                    {content.title}
                  </h4>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Progres Tugas:</span>
                    <span className="font-mono font-bold text-amber-400">
                      {completed}/{total} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isAllDone
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-amber-500 to-indigo-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onOpenContentDetail(content)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    Buka Detail <ExternalLink className="w-3 h-3" />
                  </button>

                  {isAllDone && content.stage !== 'evaluasi' ? (
                    <button
                      onClick={() => {
                        onUpdateStage(content.id, 'evaluasi');
                        triggerConfetti();
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-500/20"
                    >
                      <span>Publish & Evaluasi</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedContentId(content.id);
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer"
                    >
                      Filter To-Do Ini
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Bar for Todos */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Status Tabs */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Status Tugas:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="pending">Belum Selesai (Pending)</option>
              <option value="completed">Sudah Selesai (Completed)</option>
              <option value="all">Semua Status</option>
            </select>
          </div>

          {/* Phase Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Tahapan Produksi:</label>
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Semua Tahapan</option>
              {phases.map((ph) => (
                <option key={ph} value={ph}>
                  {ph}
                </option>
              ))}
            </select>
          </div>

          {/* PIC Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Penanggung Jawab (PIC):</label>
            <select
              value={selectedPic}
              onChange={(e) => setSelectedPic(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Semua Tim PIC</option>
              {brandSettings.teamMembers.map((tm) => (
                <option key={tm.id} value={tm.name}>
                  {tm.name}
                </option>
              ))}
            </select>
          </div>

          {/* Content Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Fokus Konten:</label>
            <select
              value={selectedContentId}
              onChange={(e) => setSelectedContentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Semua Konten</option>
              {contentList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title.slice(0, 30)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>Menampilkan <strong className="text-white">{filteredTodos.length}</strong> task to-do</span>
          {(selectedPhase !== 'all' || selectedPic !== 'all' || selectedContentId !== 'all' || statusFilter !== 'pending') && (
            <button
              onClick={() => {
                setSelectedPhase('all');
                setSelectedPic('all');
                setSelectedContentId('all');
                setStatusFilter('pending');
              }}
              className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Task List Items */}
      {filteredTodos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400" />
          <h3 className="text-base font-bold text-white">Tidak ada tugas dalam filter ini</h3>
          <p className="text-xs text-slate-400">
            Semua to-do untuk kriteria ini sudah selesai atau belum ditambahkan.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTodos.map((todo) => {
            const pillarColor = getPillarBadgeColor(todo.contentPillar as any);
            const platformBadge = getPlatformBadge(todo.contentPlatform as any);

            return (
              <div
                key={todo.id}
                className={`p-4 rounded-xl bg-slate-900/80 border transition-all ${
                  todo.completed
                    ? 'border-slate-800/80 opacity-70 bg-slate-950/40'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900/90 shadow-md'
                } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => {
                      onToggleTodo(todo.contentId, todo.id);
                      if (!todo.completed) triggerConfetti();
                    }}
                    className="mt-1 w-5 h-5 rounded-md border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-950 cursor-pointer"
                  />
                  <div className="space-y-1 min-w-0">
                    <p
                      className={`text-sm font-semibold transition-all ${
                        todo.completed ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {todo.title}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
                      <span className="font-medium text-indigo-400 truncate max-w-[240px]">
                        Konten: {todo.contentTitle}
                      </span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold">
                        {todo.phase}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <User className="w-3 h-3 text-slate-500" />
                        {todo.pic}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {todo.dueDate && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatDateIndo(todo.dueDate)}</span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      const matched = contentList.find((c) => c.id === todo.contentId);
                      if (matched) onOpenContentDetail(matched);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Buka Konten Terkait"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Add To-Do Modal */}
      {isAddingTodo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                Tambah Tugas Eksekusi Baru
              </h3>
              <button
                onClick={() => setIsAddingTodo(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTodo} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Pilih Konten yang Akan Dikerjakan:
                </label>
                <select
                  value={targetContentId}
                  onChange={(e) => setTargetContentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  required
                >
                  {contentList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.stage})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Judul Tugas / Aktivitas:
                </label>
                <input
                  type="text"
                  value={newTodoTitle}
                  onChange={(e) => setNewTodoTitle(e.target.value)}
                  placeholder="Contoh: Take footage b-roll detail resleting jaket..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Tahapan Produksi:
                  </label>
                  <select
                    value={newTodoPhase}
                    onChange={(e) => setNewTodoPhase(e.target.value as TodoPhase)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {phases.map((ph) => (
                      <option key={ph} value={ph}>
                        {ph}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Penanggung Jawab (PIC):
                  </label>
                  <select
                    value={newTodoPic}
                    onChange={(e) => setNewTodoPic(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {brandSettings.teamMembers.map((tm) => (
                      <option key={tm.id} value={tm.name}>
                        {tm.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Tenggat Waktu (Due Date):
                </label>
                <input
                  type="date"
                  value={newTodoDueDate}
                  onChange={(e) => setNewTodoDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingTodo(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Simpan To-Do
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
