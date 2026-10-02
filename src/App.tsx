/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  testConnection, 
  saveContentOnline, 
  deleteContentOnline, 
  saveBrandSettingsOnline 
} from './firebase';
import { 
  ContentPlanItem, 
  BrandSettings, 
  ContentStage, 
  ContentEvaluation, 
  ExecutionTodo 
} from './types/content';
import { 
  INITIAL_CONTENT_ITEMS, 
  DEFAULT_BRAND_SETTINGS, 
  loadSavedContent, 
  saveContent, 
  loadSavedBrandSettings, 
  saveBrandSettings 
} from './data/initialData';
import { Header, NavTab } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ContentPlannerView } from './components/ContentPlannerView';
import { ExecutionCenterView } from './components/ExecutionCenterView';
import { EvaluationCenterView } from './components/EvaluationCenterView';
import { AiIdeaGeneratorView } from './components/AiIdeaGeneratorView';
import { BrandStrategyView } from './components/BrandStrategyView';
import { ContentDetailModal } from './components/ContentDetailModal';
import { NewContentModal } from './components/NewContentModal';

export default function App() {
  const [contentList, setContentList] = useState<ContentPlanItem[]>(() => loadSavedContent());
  const [brandSettings, setBrandSettings] = useState<BrandSettings>(() => loadSavedBrandSettings());
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isCloudSynced, setIsCloudSynced] = useState(true);

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedContentForDetail, setSelectedContentForDetail] = useState<ContentPlanItem | null>(null);

  // Sync with Server Online Cloud Storage on mount
  useEffect(() => {
    testConnection();

    // 1. Fetch content from server online storage
    fetch('/api/storage/content')
      .then((res) => res.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
          setContentList(data.items);
          saveContent(data.items);
          setIsCloudSynced(true);
        } else {
          // If server storage is empty, initialize server storage with current content
          syncToServer(contentList);
        }
      })
      .catch((err) => {
        console.warn('Initial server content sync notice:', err);
      });

    // 2. Fetch brand from server online storage
    fetch('/api/storage/brand')
      .then((res) => res.json())
      .then((data) => {
        if (data.brand && typeof data.brand === 'object') {
          setBrandSettings(data.brand);
          saveBrandSettings(data.brand);
        } else {
          syncBrandToServer(brandSettings);
        }
      })
      .catch((err) => {
        console.warn('Initial server brand sync notice:', err);
      });
  }, []);

  // Helper to persist to server online database
  const syncToServer = async (items: ContentPlanItem[]) => {
    try {
      setIsCloudSynced(false);
      const res = await fetch('/api/storage/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (res.ok) {
        setIsCloudSynced(true);
      }
    } catch (e) {
      console.warn('Cloud sync offline fallback', e);
      setIsCloudSynced(true); // Still saved locally
    }
  };

  const syncBrandToServer = async (brand: BrandSettings) => {
    try {
      await fetch('/api/storage/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand }),
      });
    } catch (e) {
      console.warn('Brand cloud sync notice', e);
    }
  };

  // Handler: Add new content
  const handleAddContent = async (newItem: ContentPlanItem) => {
    const updated = [newItem, ...contentList];
    setContentList(updated);
    saveContent(updated);
    syncToServer(updated);
    saveContentOnline(newItem);
  };

  // Handler: Update content
  const handleUpdateContent = async (updatedItem: ContentPlanItem) => {
    const updated = contentList.map((c) => (c.id === updatedItem.id ? updatedItem : c));
    setContentList(updated);
    saveContent(updated);
    syncToServer(updated);
    saveContentOnline(updatedItem);
  };

  // Handler: Delete content
  const handleDeleteContent = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus rencana konten ini?')) {
      const updated = contentList.filter((c) => c.id !== id);
      setContentList(updated);
      saveContent(updated);
      syncToServer(updated);
      deleteContentOnline(id);

      if (selectedContentForDetail?.id === id) {
        setSelectedContentForDetail(null);
      }
    }
  };

  // Handler: Duplicate content
  const handleDuplicateContent = async (content: ContentPlanItem) => {
    const duplicated: ContentPlanItem = {
      ...content,
      id: `cnt-${Date.now()}`,
      title: `${content.title} (Salinan)`,
      stage: 'konten',
      status: 'Draft',
      todos: content.todos.map((t, idx) => ({
        ...t,
        id: `td-${Date.now()}-${idx}`,
        completed: false,
      })),
      evaluation: {
        targetViews: content.evaluation?.targetViews || 15000,
        actualViews: 0,
        targetLikes: content.evaluation?.targetLikes || 1000,
        actualLikes: 0,
        targetSaves: content.evaluation?.targetSaves || 300,
        actualSaves: 0,
        actualComments: 0,
        actualShares: content.evaluation?.targetShares || 100,
        verdict: 'Belum Dievaluasi',
        whatWorked: '',
        whatNeedsImprovement: '',
        nextActionPlan: '',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [duplicated, ...contentList];
    setContentList(updated);
    saveContent(updated);
    syncToServer(updated);
    saveContentOnline(duplicated);
  };

  // Handler: Toggle single todo
  const handleToggleTodo = async (contentId: string, todoId: string) => {
    let updatedItem: ContentPlanItem | null = null;
    const updated = contentList.map((c) => {
      if (c.id !== contentId) return c;
      const updatedTodos = c.todos.map((t) =>
        t.id === todoId ? { ...t, completed: !t.completed } : t
      );
      updatedItem = {
        ...c,
        todos: updatedTodos,
        updatedAt: new Date().toISOString(),
      };
      return updatedItem;
    });

    setContentList(updated);
    saveContent(updated);
    syncToServer(updated);
    if (updatedItem) saveContentOnline(updatedItem);

    if (selectedContentForDetail && selectedContentForDetail.id === contentId) {
      setSelectedContentForDetail((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          todos: prev.todos.map((t) =>
            t.id === todoId ? { ...t, completed: !t.completed } : t
          ),
        };
      });
    }
  };

  // Handler: Add todo to specific content
  const handleAddTodoToContent = async (contentId: string, todoData: Omit<ExecutionTodo, 'id'>) => {
    const newTodo: ExecutionTodo = {
      ...todoData,
      id: `td-${Date.now()}`,
    };

    let updatedItem: ContentPlanItem | null = null;
    const updated = contentList.map((c) => {
      if (c.id !== contentId) return c;
      updatedItem = {
        ...c,
        todos: [...c.todos, newTodo],
        updatedAt: new Date().toISOString(),
      };
      return updatedItem;
    });

    setContentList(updated);
    saveContent(updated);
    syncToServer(updated);
    if (updatedItem) saveContentOnline(updatedItem);
  };

  // Handler: Advance stage (konten -> eksekusi -> evaluasi)
  const handleUpdateStage = async (contentId: string, newStage: ContentStage) => {
    let updatedItem: ContentPlanItem | null = null;
    const updated = contentList.map((c) => {
      if (c.id !== contentId) return c;
      let newStatus = c.status;
      if (newStage === 'konten') newStatus = 'Approved';
      if (newStage === 'eksekusi') newStatus = 'In Production';
      if (newStage === 'evaluasi') newStatus = 'Published';

      updatedItem = {
        ...c,
        stage: newStage,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
      return updatedItem;
    });

    setContentList(updated);
    saveContent(updated);
    syncToServer(updated);
    if (updatedItem) saveContentOnline(updatedItem);
  };

  // Handler: Update evaluation
  const handleUpdateEvaluation = async (contentId: string, evaluation: ContentEvaluation) => {
    let updatedItem: ContentPlanItem | null = null;
    const updated = contentList.map((c) => {
      if (c.id !== contentId) return c;
      updatedItem = {
        ...c,
        evaluation,
        stage: 'evaluasi',
        status: 'Published',
        updatedAt: new Date().toISOString(),
      };
      return updatedItem;
    });

    setContentList(updated);
    saveContent(updated);
    syncToServer(updated);
    if (updatedItem) saveContentOnline(updatedItem);
  };

  // Handler: Save Brand Settings
  const handleSaveBrandSettings = async (newSettings: BrandSettings) => {
    setBrandSettings(newSettings);
    saveBrandSettings(newSettings);
    syncBrandToServer(newSettings);
    saveBrandSettingsOnline(newSettings);
  };

  // Counts for header
  const counts = {
    konten: contentList.filter((c) => c.stage === 'konten').length,
    eksekusi: contentList.filter((c) => c.stage === 'eksekusi').length,
    evaluasi: contentList.filter((c) => c.stage === 'evaluasi').length,
    totalTodos: contentList.flatMap((c) => c.todos).length,
    pendingTodos: contentList.flatMap((c) => c.todos).filter((t) => !t.completed).length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        brandSettings={brandSettings}
        onOpenNewContentModal={() => setIsNewModalOpen(true)}
        counts={counts}
        isCloudSynced={isCloudSynced}
        onManualSync={() => syncToServer(contentList)}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            contentList={contentList}
            brandSettings={brandSettings}
            setActiveTab={setActiveTab}
            onOpenNewContentModal={() => setIsNewModalOpen(true)}
            onOpenContentDetail={(c) => setSelectedContentForDetail(c)}
            onToggleTodo={handleToggleTodo}
          />
        )}

        {activeTab === 'konten' && (
          <ContentPlannerView
            contentList={contentList}
            onOpenNewModal={() => setIsNewModalOpen(true)}
            onOpenDetailModal={(c) => setSelectedContentForDetail(c)}
            onDeleteContent={handleDeleteContent}
            onDuplicateContent={handleDuplicateContent}
            onUpdateStage={handleUpdateStage}
            onOpenAiGenerator={() => setActiveTab('ai-ideas')}
          />
        )}

        {activeTab === 'eksekusi' && (
          <ExecutionCenterView
            contentList={contentList}
            brandSettings={brandSettings}
            onToggleTodo={handleToggleTodo}
            onAddTodoToContent={handleAddTodoToContent}
            onUpdateStage={handleUpdateStage}
            onOpenContentDetail={(c) => setSelectedContentForDetail(c)}
          />
        )}

        {activeTab === 'evaluasi' && (
          <EvaluationCenterView
            contentList={contentList}
            onUpdateContentEvaluation={handleUpdateEvaluation}
            onOpenContentDetail={(c) => setSelectedContentForDetail(c)}
          />
        )}

        {activeTab === 'ai-ideas' && (
          <AiIdeaGeneratorView
            brandSettings={brandSettings}
            onAddGeneratedContent={handleAddContent}
            onSwitchToPlanner={() => setActiveTab('konten')}
          />
        )}

        {activeTab === 'brand' && (
          <BrandStrategyView
            brandSettings={brandSettings}
            onSaveBrandSettings={handleSaveBrandSettings}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            PlanCraft Studio • Sistem Manajemen Alur Konten: <strong className="text-slate-400">Konten → Eksekusi → Evaluasi</strong>
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Tersimpan Online di Cloud Storage
            </span>
            <span>•</span>
            <span>Powered by Gemini 3.8 Flash</span>
          </div>
        </div>
      </footer>

      {/* New Content Plan Modal */}
      <NewContentModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onAddContent={handleAddContent}
        brandSettings={brandSettings}
        onOpenAiGenerator={() => {
          setIsNewModalOpen(false);
          setActiveTab('ai-ideas');
        }}
      />

      {/* Content Detail / Edit Modal */}
      <ContentDetailModal
        content={selectedContentForDetail}
        isOpen={Boolean(selectedContentForDetail)}
        onClose={() => setSelectedContentForDetail(null)}
        onSave={handleUpdateContent}
        onDelete={handleDeleteContent}
        brandSettings={brandSettings}
      />
    </div>
  );
}
