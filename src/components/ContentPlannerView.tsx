import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  LayoutGrid, 
  Columns3, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Trash2, 
  Copy, 
  Edit3, 
  ExternalLink,
  Target
} from 'lucide-react';
import { 
  ContentPlanItem, 
  ContentPillar, 
  ContentPlatform, 
  ContentGoal, 
  ContentStage 
} from '../types/content';
import { 
  formatDateIndo, 
  getPillarBadgeColor, 
  getPlatformBadge, 
  getStageDetails, 
  getStatusBadge,
  triggerConfetti
} from '../utils/helpers';

interface ContentPlannerViewProps {
  contentList: ContentPlanItem[];
  onOpenNewModal: () => void;
  onOpenDetailModal: (content: ContentPlanItem) => void;
  onDeleteContent: (id: string) => void;
  onDuplicateContent: (content: ContentPlanItem) => void;
  onUpdateStage: (contentId: string, stage: ContentStage) => void;
  onOpenAiGenerator: () => void;
}

export const ContentPlannerView: React.FC<ContentPlannerViewProps> = ({
  contentList,
  onOpenNewModal,
  onOpenDetailModal,
  onDeleteContent,
  onDuplicateContent,
  onUpdateStage,
  onOpenAiGenerator,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');

  // Filter content
  const filteredContent = contentList.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hook.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.captionScript.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPillar = selectedPillar === 'all' || item.pillar === selectedPillar;
    const matchesPlatform = selectedPlatform === 'all' || item.platform === selectedPlatform;
    const matchesStage = selectedStage === 'all' || item.stage === selectedStage;

    return matchesSearch && matchesPillar && matchesPlatform && matchesStage;
  });

  const pillars: ContentPillar[] = [
    'Edukasi',
    'Promosi',
    'Hiburan',
    'Inspirasi',
    'Behind the Scenes',
    'Interaksi',
  ];

  const platforms: ContentPlatform[] = [
    'Instagram',
    'TikTok',
    'YouTube',
    'LinkedIn',
    'X / Twitter',
    'Facebook',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Perencanaan Konten (Content Planner)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Susun strategi, tujuan pemasaran, pilar konten, hook viral, dan naskah sebelum masuk ke tahap produksi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tampilan Grid Card"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tampilan Kanban Pipeline"
            >
              <Columns3 className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenAiGenerator}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/20 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Generator AI</span>
          </button>

          <button
            onClick={onOpenNewModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Konten</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul, hook, atau caption..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Filter Stage */}
          <div>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="all">Semua Tahap Alur</option>
              <option value="konten">1. Tahap Rencana Konten</option>
              <option value="eksekusi">2. Tahap Eksekusi Produksi</option>
              <option value="evaluasi">3. Tahap Evaluasi Kinerja</option>
            </select>
          </div>

          {/* Filter Pilar */}
          <div>
            <select
              value={selectedPillar}
              onChange={(e) => setSelectedPillar(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="all">Semua Pilar Konten</option>
              {pillars.map((p) => (
                <option key={p} value={p}>
                  Pilar: {p}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Platform */}
          <div>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="all">Semua Platform</option>
              {platforms.map((pl) => (
                <option key={pl} value={pl}>
                  {pl}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter chips count */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>Menampilkan <strong className="text-white">{filteredContent.length}</strong> dari {contentList.length} rencana konten</span>
          {(searchQuery || selectedPillar !== 'all' || selectedPlatform !== 'all' || selectedStage !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedPillar('all');
                setSelectedPlatform('all');
                setSelectedStage('all');
              }}
              className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {filteredContent.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Filter className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">Tidak ada konten yang cocok</h3>
            <p className="text-xs text-slate-400">
              Coba sesuaikan filter pencarian atau buat ide konten baru dengan generator AI kami.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onOpenAiGenerator}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white cursor-pointer"
            >
              Cari Ide dengan AI
            </button>
            <button
              onClick={onOpenNewModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
            >
              Tambah Konten Manual
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredContent.map((item) => {
            const pillarColor = getPillarBadgeColor(item.pillar);
            const platformBadge = getPlatformBadge(item.platform);
            const stageDetail = getStageDetails(item.stage);
            const statusBadge = getStatusBadge(item.status);

            const totalTodos = item.todos.length;
            const completedTodos = item.todos.filter((t) => t.completed).length;
            const percentTodos = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

            return (
              <div
                key={item.id}
                className="group rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between overflow-hidden shadow-lg shadow-black/20"
              >
                {/* Header & Badges */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${pillarColor.bg} ${pillarColor.text} ${pillarColor.border}`}>
                      {item.pillar}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${platformBadge.color}`}>
                      {item.platform}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${stageDetail.badgeClass} ml-auto`}>
                      {stageDetail.label}
                    </span>
                  </div>

                  {/* Title & Goal */}
                  <div>
                    <h3 
                      onClick={() => onOpenDetailModal(item)}
                      className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors cursor-pointer line-clamp-2"
                    >
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                      <Target className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">Tujuan: <strong className="text-slate-300">{item.goal}</strong></span>
                    </div>
                  </div>

                  {/* Hook Quote Box */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      ⚡ Hook 3 Detik:
                    </span>
                    <p className="text-xs text-slate-300 italic line-clamp-2">
                      "{item.hook || 'Belum dirumuskan'}"
                    </p>
                  </div>

                  {/* Execution To-Do Progress */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        Checklist Eksekusi:
                      </span>
                      <span className="font-mono text-slate-300 font-semibold">
                        {completedTodos}/{totalTodos} ({percentTodos}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                        style={{ width: `${percentTodos}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Controls & Transition Actions */}
                <div className="px-5 py-3.5 bg-slate-950/80 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{formatDateIndo(item.scheduledDate)} {item.scheduledTime ? `• ${item.scheduledTime}` : ''}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${statusBadge.badgeClass}`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Step Transition Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenDetailModal(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit / Detail Konten"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDuplicateContent(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Duplikasi Rencana"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteContent(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Hapus Konten"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Integrated flow step-advancer */}
                    {item.stage === 'konten' && (
                      <button
                        onClick={() => {
                          onUpdateStage(item.id, 'eksekusi');
                          triggerConfetti();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition-all cursor-pointer"
                      >
                        <span>Mulai Eksekusi</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {item.stage === 'eksekusi' && (
                      <button
                        onClick={() => {
                          onUpdateStage(item.id, 'evaluasi');
                          triggerConfetti();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-all cursor-pointer"
                      >
                        <span>Tayang & Evaluasi</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {item.stage === 'evaluasi' && (
                      <button
                        onClick={() => onOpenDetailModal(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 transition-all cursor-pointer"
                      >
                        <span>Lihat Evaluasi</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* KANBAN PIPELINE VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Konten */}
          <div className="space-y-4 rounded-2xl bg-slate-900/60 border border-slate-800 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <h3 className="font-bold text-sm text-white">1. Rencana Konten</h3>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                {contentList.filter((c) => c.stage === 'konten').length}
              </span>
            </div>

            <div className="space-y-3">
              {contentList
                .filter((c) => c.stage === 'konten')
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onOpenDetailModal(item)}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-indigo-500/40 transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-indigo-400 font-semibold">{item.pillar}</span>
                      <span className="text-slate-400">{item.platform}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100 line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 italic line-clamp-1">
                      "{item.hook}"
                    </p>
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">{formatDateIndo(item.scheduledDate)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStage(item.id, 'eksekusi');
                          triggerConfetti();
                        }}
                        className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                      >
                        Ke Eksekusi →
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Column 2: Eksekusi */}
          <div className="space-y-4 rounded-2xl bg-slate-900/60 border border-slate-800 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <h3 className="font-bold text-sm text-white">2. Eksekusi Produksi</h3>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                {contentList.filter((c) => c.stage === 'eksekusi').length}
              </span>
            </div>

            <div className="space-y-3">
              {contentList
                .filter((c) => c.stage === 'eksekusi')
                .map((item) => {
                  const completed = item.todos.filter((t) => t.completed).length;
                  const total = item.todos.length;
                  return (
                    <div
                      key={item.id}
                      onClick={() => onOpenDetailModal(item)}
                      className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-amber-500/40 transition-all cursor-pointer space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-amber-400 font-semibold">{item.pillar}</span>
                        <span className="text-slate-400">{item.platform}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-100 line-clamp-2">
                        {item.title}
                      </h4>
                      <div className="text-xs text-slate-400 flex items-center justify-between">
                        <span>Checklist:</span>
                        <span className="font-mono text-amber-400 font-semibold">
                          {completed}/{total} Selesai
                        </span>
                      </div>
                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">{formatDateIndo(item.scheduledDate)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStage(item.id, 'evaluasi');
                            triggerConfetti();
                          }}
                          className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                        >
                          Ke Evaluasi →
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Column 3: Evaluasi */}
          <div className="space-y-4 rounded-2xl bg-slate-900/60 border border-slate-800 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <h3 className="font-bold text-sm text-white">3. Evaluasi Kinerja</h3>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                {contentList.filter((c) => c.stage === 'evaluasi').length}
              </span>
            </div>

            <div className="space-y-3">
              {contentList
                .filter((c) => c.stage === 'evaluasi')
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onOpenDetailModal(item)}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-emerald-500/40 transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-emerald-400 font-semibold">{item.pillar}</span>
                      <span className="text-slate-400">{item.platform}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100 line-clamp-2">
                      {item.title}
                    </h4>
                    <div className="text-xs text-slate-400 flex items-center justify-between">
                      <span>Status:</span>
                      <span className="font-mono text-emerald-400 font-semibold">
                        {item.evaluation?.actualViews ? `Views: ${item.evaluation.actualViews.toLocaleString('id-ID')}` : 'Menunggu Input'}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">{formatDateIndo(item.scheduledDate)}</span>
                      <span className="text-[11px] font-semibold text-indigo-400">
                        Buka Skor →
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
