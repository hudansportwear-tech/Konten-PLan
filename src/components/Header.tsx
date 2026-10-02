import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  BarChart3, 
  Sparkles, 
  Compass,
  Plus,
  ArrowRight,
  Cloud,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { BrandSettings } from '../types/content';

export type NavTab = 'dashboard' | 'konten' | 'eksekusi' | 'evaluasi' | 'ai-ideas' | 'brand';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  brandSettings: BrandSettings;
  onOpenNewContentModal: () => void;
  counts: {
    konten: number;
    eksekusi: number;
    evaluasi: number;
    totalTodos: number;
    pendingTodos: number;
  };
  isCloudSynced: boolean;
  onManualSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  brandSettings,
  onOpenNewContentModal,
  counts,
  isCloudSynced,
  onManualSync,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with Brand & Actions */}
        <div className="flex items-center justify-between py-3 border-b border-slate-800/60 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-indigo-400 font-black text-lg">
                PC
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  PlanCraft <span className="text-indigo-400">Studio</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Cloud Live
                </span>
                {/* Cloud Status Pill */}
                <div 
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                    isCloudSynced
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                  title={isCloudSynced ? 'Data tersimpan otomatis di cloud database online' : 'Menyinkronkan ke cloud...'}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isCloudSynced ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <Cloud className="w-3 h-3 text-emerald-400" />
                  <span>{isCloudSynced ? 'Tersimpan Online di Cloud' : 'Menyinkronkan...'}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-sm">
                {brandSettings.brandName} • <span className="text-slate-500">{brandSettings.niche}</span>
              </p>
            </div>
          </div>

          {/* Flow Stepper Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
            <span className="text-slate-400 font-medium">Alur Terpadu:</span>
            <span className={`px-2 py-0.5 rounded font-semibold ${activeTab === 'konten' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400'}`}>
              1. Konten ({counts.konten})
            </span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className={`px-2 py-0.5 rounded font-semibold ${activeTab === 'eksekusi' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400'}`}>
              2. Eksekusi ({counts.pendingTodos} to-do)
            </span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className={`px-2 py-0.5 rounded font-semibold ${activeTab === 'evaluasi' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'}`}>
              3. Evaluasi ({counts.evaluasi})
            </span>
          </div>

          {/* User Account & Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ai-ideas')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">Generator Ide</span> AI
            </button>
            <button
              onClick={onOpenNewContentModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Rencana</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex items-center space-x-1 sm:space-x-2 py-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('konten')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'konten'
                ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Rencana Konten</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-semibold">
              {counts.konten}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('eksekusi')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'eksekusi'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>2. Pusat Eksekusi (To-Do)</span>
            {counts.pendingTodos > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                {counts.pendingTodos}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('evaluasi')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'evaluasi'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>3. Evaluasi Kinerja</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
              {counts.evaluasi}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ai-ideas')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'ai-ideas'
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Saran Konten AI</span>
          </button>

          <button
            onClick={() => setActiveTab('brand')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'brand'
                ? 'bg-slate-800 text-slate-200 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Pilar & Strategi</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
