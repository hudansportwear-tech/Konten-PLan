import React from 'react';
import { 
  FileText, 
  CheckSquare, 
  BarChart3, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  ArrowRight, 
  Clock, 
  Award,
  Plus,
  Play
} from 'lucide-react';
import { ContentPlanItem, BrandSettings } from '../types/content';
import { 
  formatDateIndo, 
  getPillarBadgeColor, 
  getPlatformBadge, 
  getStageDetails,
  triggerConfetti
} from '../utils/helpers';
import { NavTab } from './Header';

interface DashboardViewProps {
  contentList: ContentPlanItem[];
  brandSettings: BrandSettings;
  setActiveTab: (tab: NavTab) => void;
  onOpenNewContentModal: () => void;
  onOpenContentDetail: (content: ContentPlanItem) => void;
  onToggleTodo: (contentId: string, todoId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  contentList,
  brandSettings,
  setActiveTab,
  onOpenNewContentModal,
  onOpenContentDetail,
  onToggleTodo,
}) => {
  // Counts by stages
  const kontenItems = contentList.filter((c) => c.stage === 'konten');
  const eksekusiItems = contentList.filter((c) => c.stage === 'eksekusi');
  const evaluasiItems = contentList.filter((c) => c.stage === 'evaluasi');

  // Aggregated Todos
  const allTodos = contentList.flatMap((c) =>
    c.todos.map((t) => ({ ...t, contentId: c.id, contentTitle: c.title, stage: c.stage }))
  );
  const completedTodosCount = allTodos.filter((t) => t.completed).length;
  const pendingTodos = allTodos.filter((t) => !t.completed);
  const todoCompletionRate = allTodos.length > 0 
    ? Math.round((completedTodosCount / allTodos.length) * 100) 
    : 0;

  // Evaluated stats
  const evaluatedItems = contentList.filter((c) => c.evaluation && c.evaluation.actualViews > 0);
  const totalViews = evaluatedItems.reduce((acc, curr) => acc + (curr.evaluation?.actualViews || 0), 0);
  const avgER = evaluatedItems.length > 0
    ? (
        evaluatedItems.reduce((acc, curr) => acc + (curr.evaluation?.engagementRate || 0), 0) /
        evaluatedItems.length
      ).toFixed(1)
    : '0';

  // Pillar distribution
  const pillarCounts: Record<string, number> = {};
  contentList.forEach((c) => {
    pillarCounts[c.pillar] = (pillarCounts[c.pillar] || 0) + 1;
  });

  // Upcoming scheduled content
  const sortedUpcoming = [...contentList]
    .filter((c) => c.status !== 'Published')
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 4);

  // Top performing content
  const topPerformers = [...evaluatedItems]
    .sort((a, b) => (b.evaluation?.engagementRate || 0) - (a.evaluation?.engagementRate || 0))
    .slice(0, 3);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome & Campaign Context */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Sistem Alur Terintegrasi: Konten → Eksekusi → Evaluasi
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pusat Komando Konten: {brandSettings.brandName}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Pantau seluruh siklus konten Anda mulai dari perumusan ide & tujuan strategis, eksekusi checklist produksi to-do list, hingga evaluasi mendalam performa audiens.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('ai-ideas')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Saran Konten AI
            </button>
            <button
              onClick={onOpenNewContentModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Buat Rencana Konten
            </button>
          </div>
        </div>

        {/* Decorative background grid */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 3-Step Pipeline Flow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Step 1: Konten */}
        <div 
          onClick={() => setActiveTab('konten')}
          className="group relative rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 p-5 transition-all cursor-pointer hover:shadow-xl hover:shadow-indigo-500/5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Tahap 1
            </span>
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
            1. Perencanaan Konten
          </h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Riset, pilar konten, target tujuan kampanye, hook, dan draft naskah/caption.
          </p>
          <div className="flex items-baseline justify-between pt-3 border-t border-slate-800/80">
            <div>
              <span className="text-2xl font-black text-white">{kontenItems.length}</span>
              <span className="text-xs text-slate-400 ml-1.5">Ide & Rencana</span>
            </div>
            <span className="text-xs font-medium text-indigo-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Lihat Rencana <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Step 2: Eksekusi */}
        <div 
          onClick={() => setActiveTab('eksekusi')}
          className="group relative rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 p-5 transition-all cursor-pointer hover:shadow-xl hover:shadow-amber-500/5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Tahap 2
            </span>
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
            2. Eksekusi Produksi (To-Do)
          </h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Checklist to-do terpadu: scriptwriting, syuting video, editing, & approval PIC.
          </p>
          <div className="flex items-baseline justify-between pt-3 border-t border-slate-800/80">
            <div>
              <span className="text-2xl font-black text-amber-400">{pendingTodos.length}</span>
              <span className="text-xs text-slate-400 ml-1.5">To-Do Aktif ({todoCompletionRate}% tuntas)</span>
            </div>
            <span className="text-xs font-medium text-amber-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Buka Task Board <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Step 3: Evaluasi */}
        <div 
          onClick={() => setActiveTab('evaluasi')}
          className="group relative rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 p-5 transition-all cursor-pointer hover:shadow-xl hover:shadow-emerald-500/5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Tahap 3
            </span>
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
            3. Evaluasi & Analitik Kinerja
          </h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Pencatatan metrik aktual (views, ER, saves), post-mortem AI & catatan evaluasi.
          </p>
          <div className="flex items-baseline justify-between pt-3 border-t border-slate-800/80">
            <div>
              <span className="text-2xl font-black text-emerald-400">{evaluasiItems.length}</span>
              <span className="text-xs text-slate-400 ml-1.5">Konten (Avg ER: {avgER}%)</span>
            </div>
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Lihat Analitik <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Left (Upcoming & ToDos), Right (Pillar distribution & Top Performers) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick To-Do List Tracker */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">
                  Checklist To-Do Eksekusi Mendesak
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('eksekusi')}
                className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                Semua To-Do ({allTodos.length}) <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {pendingTodos.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                🎉 Luar biasa! Semua to-do eksekusi saat ini sudah diselesaikan.
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingTodos.slice(0, 5).map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => {
                          onToggleTodo(todo.contentId, todo.id);
                          triggerConfetti();
                        }}
                        className="mt-0.5 w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {todo.title}
                        </p>
                        <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="text-indigo-400 truncate max-w-[200px] font-medium">
                            {todo.contentTitle}
                          </span>
                          <span>•</span>
                          <span className="text-amber-400/90">{todo.phase}</span>
                          <span>•</span>
                          <span className="text-slate-500">{todo.pic}</span>
                        </p>
                      </div>
                    </div>

                    {todo.dueDate && (
                      <span className="text-[11px] px-2 py-0.5 rounded font-mono text-slate-400 bg-slate-900 border border-slate-800 whitespace-nowrap ml-2">
                        {formatDateIndo(todo.dueDate)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Content Schedule */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">
                  Jadwal Rencana Tayang Terdekat
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('konten')}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                Lihat Kalender & Rencana <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sortedUpcoming.map((item) => {
                const pillarColor = getPillarBadgeColor(item.pillar);
                const platformBadge = getPlatformBadge(item.platform);
                const stageDetail = getStageDetails(item.stage);

                return (
                  <div
                    key={item.id}
                    onClick={() => onOpenContentDetail(item)}
                    className="group p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${pillarColor.bg} ${pillarColor.text} ${pillarColor.border}`}>
                          {item.pillar}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${platformBadge.color}`}>
                          {item.platform}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-100 line-clamp-2 group-hover:text-indigo-300 transition-colors mb-2">
                        {item.title}
                      </h4>

                      <p className="text-xs text-slate-400 italic line-clamp-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                        "{item.hook || 'Belum ada hook'}"
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{formatDateIndo(item.scheduledDate)} {item.scheduledTime ? `• ${item.scheduledTime}` : ''}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${stageDetail.badgeClass}`}>
                        {item.stage === 'konten' ? 'Rencana' : item.stage === 'eksekusi' ? 'Eksekusi' : 'Evaluasi'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Top Leaderboard & Content Pillars */}
        <div className="space-y-6">
          {/* Top Performing Content Card */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Leaderboard Konten</h3>
              </div>
              <button
                onClick={() => setActiveTab('evaluasi')}
                className="text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer"
              >
                Analitik Detail
              </button>
            </div>

            {topPerformers.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Belum ada konten yang dievaluasi. Masukkan metrik kinerja di tab Evaluasi.
              </p>
            ) : (
              <div className="space-y-3">
                {topPerformers.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => onOpenContentDetail(item)}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-amber-400">#{idx + 1} Best Performer</span>
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        ER {item.evaluation?.engagementRate}%
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-200 line-clamp-1">
                      {item.title}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
                      <span>{item.evaluation?.actualViews.toLocaleString('id-ID')} views</span>
                      <span>{item.evaluation?.actualSaves.toLocaleString('id-ID')} simpanan</span>
                      <span>{item.evaluation?.actualShares.toLocaleString('id-ID')} share</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pilar Konten Distribution */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Distribusi Pilar Konten</h3>
              <button
                onClick={() => setActiveTab('brand')}
                className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                Atur Pilar
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(pillarCounts).map(([pillar, count]) => {
                const percentage = Math.round((count / contentList.length) * 100);
                const pillarColor = getPillarBadgeColor(pillar as any);

                return (
                  <div key={pillar} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-300">{pillar}</span>
                      <span className="text-slate-400 font-mono">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          pillar === 'Edukasi'
                            ? 'bg-blue-500'
                            : pillar === 'Promosi'
                            ? 'bg-emerald-500'
                            : pillar === 'Hiburan'
                            ? 'bg-amber-500'
                            : pillar === 'Inspirasi'
                            ? 'bg-purple-500'
                            : 'bg-cyan-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400">
              💡 <span className="text-slate-300 font-semibold">Tips Rasio Ideal:</span> 40% Edukasi, 25% Hiburan/Relatable, 20% Promosi/Sales, 15% Behind The Scenes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
