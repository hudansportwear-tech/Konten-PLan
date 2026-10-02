import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink, 
  Edit3, 
  Save, 
  Target, 
  Share2, 
  Bookmark, 
  Heart, 
  MessageCircle, 
  Eye,
  MousePointerClick
} from 'lucide-react';
import { 
  ContentPlanItem, 
  ContentEvaluation, 
  EvaluationVerdict 
} from '../types/content';
import { 
  formatDateIndo, 
  getPillarBadgeColor, 
  getPlatformBadge, 
  calculateEngagementRate, 
  triggerConfetti 
} from '../utils/helpers';

interface EvaluationCenterViewProps {
  contentList: ContentPlanItem[];
  onUpdateContentEvaluation: (contentId: string, evaluation: ContentEvaluation) => void;
  onOpenContentDetail: (content: ContentPlanItem) => void;
}

export const EvaluationCenterView: React.FC<EvaluationCenterViewProps> = ({
  contentList,
  onUpdateContentEvaluation,
  onOpenContentDetail,
}) => {
  // Published or evaluation-ready contents
  const publishedContents = contentList.filter(
    (c) => c.stage === 'evaluasi' || c.status === 'Published' || (c.evaluation && c.evaluation.actualViews > 0)
  );

  // Editing state for modal or inline evaluation form
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [formMetrics, setFormMetrics] = useState<{
    postUrl: string;
    actualViews: number;
    actualLikes: number;
    actualComments: number;
    actualShares: number;
    actualSaves: number;
    actualClicks: number;
    targetViews: number;
    whatWorked: string;
    whatNeedsImprovement: string;
    nextActionPlan: string;
  }>({
    postUrl: '',
    actualViews: 0,
    actualLikes: 0,
    actualComments: 0,
    actualShares: 0,
    actualSaves: 0,
    actualClicks: 0,
    targetViews: 10000,
    whatWorked: '',
    whatNeedsImprovement: '',
    nextActionPlan: '',
  });

  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // Overall Stats
  const totalViews = publishedContents.reduce((acc, c) => acc + (c.evaluation?.actualViews || 0), 0);
  const totalLikes = publishedContents.reduce((acc, c) => acc + (c.evaluation?.actualLikes || 0), 0);
  const totalSaves = publishedContents.reduce((acc, c) => acc + (c.evaluation?.actualSaves || 0), 0);
  const totalShares = publishedContents.reduce((acc, c) => acc + (c.evaluation?.actualShares || 0), 0);
  
  const evaluatedItems = publishedContents.filter((c) => (c.evaluation?.actualViews || 0) > 0);
  const avgER = evaluatedItems.length > 0
    ? (
        evaluatedItems.reduce((acc, c) => acc + (c.evaluation?.engagementRate || 0), 0) /
        evaluatedItems.length
      ).toFixed(2)
    : '0';

  const startEdit = (item: ContentPlanItem) => {
    setEditingContentId(item.id);
    const ev = item.evaluation;
    setFormMetrics({
      postUrl: ev?.postUrl || '',
      actualViews: ev?.actualViews || 0,
      actualLikes: ev?.actualLikes || 0,
      actualComments: ev?.actualComments || 0,
      actualShares: ev?.actualShares || 0,
      actualSaves: ev?.actualSaves || 0,
      actualClicks: ev?.actualClicks || 0,
      targetViews: ev?.targetViews || 15000,
      whatWorked: ev?.whatWorked || '',
      whatNeedsImprovement: ev?.whatNeedsImprovement || '',
      nextActionPlan: ev?.nextActionPlan || '',
    });
  };

  const handleSaveEvaluation = (contentId: string) => {
    const currentItem = contentList.find((c) => c.id === contentId);
    if (!currentItem) return;

    const er = calculateEngagementRate(
      formMetrics.actualViews,
      formMetrics.actualLikes,
      formMetrics.actualComments,
      formMetrics.actualShares,
      formMetrics.actualSaves
    );

    let verdict: EvaluationVerdict = 'Belum Dievaluasi';
    if (formMetrics.actualViews > 0) {
      if (formMetrics.actualViews >= formMetrics.targetViews * 1.2 || er >= 7) {
        verdict = 'Melebihi Target';
      } else if (formMetrics.actualViews >= formMetrics.targetViews * 0.8) {
        verdict = 'Mencapai Target';
      } else {
        verdict = 'Perlu Optimasi';
      }
    }

    const updatedEvaluation: ContentEvaluation = {
      publishDate: currentItem.evaluation?.publishDate || currentItem.scheduledDate,
      postUrl: formMetrics.postUrl,
      targetViews: formMetrics.targetViews,
      actualViews: formMetrics.actualViews,
      targetLikes: currentItem.evaluation?.targetLikes || Math.round(formMetrics.targetViews * 0.06),
      actualLikes: formMetrics.actualLikes,
      targetSaves: currentItem.evaluation?.targetSaves || Math.round(formMetrics.targetViews * 0.02),
      actualSaves: formMetrics.actualSaves,
      actualComments: formMetrics.actualComments,
      actualShares: formMetrics.actualShares,
      actualClicks: formMetrics.actualClicks,
      engagementRate: er,
      verdict,
      whatWorked: formMetrics.whatWorked,
      whatNeedsImprovement: formMetrics.whatNeedsImprovement,
      nextActionPlan: formMetrics.nextActionPlan,
      aiAnalysis: currentItem.evaluation?.aiAnalysis,
    };

    onUpdateContentEvaluation(contentId, updatedEvaluation);
    setEditingContentId(null);
    triggerConfetti();
  };

  // Run AI Post-Mortem Analyzer via Gemini API
  const handleRunAiAnalysis = async (content: ContentPlanItem) => {
    setAnalyzingId(content.id);
    const ev = content.evaluation;

    try {
      const response = await fetch('/api/analyze-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: content.title,
          pillar: content.pillar,
          format: content.format,
          platform: content.platform,
          targetViews: ev?.targetViews || 10000,
          actualViews: ev?.actualViews || 0,
          actualLikes: ev?.actualLikes || 0,
          actualComments: ev?.actualComments || 0,
          actualShares: ev?.actualShares || 0,
          actualSaves: ev?.actualSaves || 0,
          actualClicks: ev?.actualClicks || 0,
          whatWorked: ev?.whatWorked || '',
          whatNeedsImprovement: ev?.whatNeedsImprovement || '',
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menganalisis evaluasi');
      }

      const aiResult = await response.json();

      const updatedEvaluation: ContentEvaluation = {
        ...(ev || {
          targetViews: 10000,
          actualViews: 0,
          targetLikes: 500,
          actualLikes: 0,
          targetSaves: 200,
          actualSaves: 0,
          actualComments: 0,
          actualShares: 0,
          verdict: 'Belum Dievaluasi',
          whatWorked: '',
          whatNeedsImprovement: '',
          nextActionPlan: '',
        }),
        aiAnalysis: {
          verdict: aiResult.verdict,
          scoreOutOf100: aiResult.scoreOutOf100 || 85,
          engagementAnalysis: aiResult.engagementAnalysis,
          keyStrengths: aiResult.keyStrengths || [],
          bottlenecks: aiResult.bottlenecks || [],
          nextContentRecommendations: aiResult.nextContentRecommendations || [],
          analyzedAt: new Date().toISOString(),
        },
      };

      onUpdateContentEvaluation(content.id, updatedEvaluation);
      triggerConfetti();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Gagal memanggil AI analyzer');
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/20 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <BarChart3 className="w-3.5 h-3.5" />
              Tahap 3: Evaluasi Kinerja & Analitik Pasca-Tayang
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pusat Evaluasi & Refleksi Performa Konten
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Ukur apakah konten berhasil mencapai tujuan awal. Catat metrik aktual (views, likes, saves, shares), temukan pola apa yang berhasil, dan dapatkan analisis cerdas dari AI untuk konten mendatang.
            </p>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Scorecard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Tayangan (Views)</span>
            <Eye className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono">
            {totalViews.toLocaleString('id-ID')}
          </p>
          <span className="text-[11px] text-slate-500">dari seluruh konten terpublikasi</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Rata-rata Engagement Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {avgER}%
          </p>
          <span className="text-[11px] text-slate-500">Benchmark industri: 3.5% - 6%</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Simpanan (Saves)</span>
            <Bookmark className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {totalSaves.toLocaleString('id-ID')}
          </p>
          <span className="text-[11px] text-slate-500">Metrik emas algoritma explore</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Share & Viral Loop</span>
            <Share2 className="w-4 h-4 text-pink-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-pink-400 font-mono">
            {totalShares.toLocaleString('id-ID')}
          </p>
          <span className="text-[11px] text-slate-500">Penyebaran organik antarkomunitas</span>
        </div>
      </div>

      {/* Content Evaluation List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400" />
          Daftar Konten Siap Evaluasi ({publishedContents.length})
        </h2>

        {publishedContents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
            <BarChart3 className="w-12 h-12 mx-auto text-slate-600" />
            <h3 className="text-base font-bold text-white">Belum ada konten dalam tahap evaluasi</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Ketika konten di tahap eksekusi selesai diproduksi dan tayang, pindahkan statusnya ke "Tayang & Evaluasi" untuk mulai mengukur performanya.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {publishedContents.map((item) => {
              const ev = item.evaluation;
              const hasActualData = (ev?.actualViews || 0) > 0;
              const isEditing = editingContentId === item.id;
              const pillarColor = getPillarBadgeColor(item.pillar);
              const platformBadge = getPlatformBadge(item.platform);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-5 shadow-xl shadow-black/20"
                >
                  {/* Top Bar: Title, Pillar, Verdict */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${pillarColor.bg} ${pillarColor.text} ${pillarColor.border}`}>
                          {item.pillar}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${platformBadge.color}`}>
                          {item.platform}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Tayang: {formatDateIndo(ev?.publishDate || item.scheduledDate)}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {item.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {ev?.verdict && (
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            ev.verdict === 'Melebihi Target'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : ev.verdict === 'Mencapai Target'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : ev.verdict === 'Perlu Optimasi'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {ev.verdict}
                        </span>
                      )}

                      {!isEditing ? (
                        <button
                          onClick={() => startEdit(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Input Metrik</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSaveEvaluation(item.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md shadow-emerald-600/20"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Simpan Evaluasi</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline Edit Form */}
                  {isEditing ? (
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                      <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        Input Hasil Realisasi Kinerja
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400">Target Views:</label>
                          <input
                            type="number"
                            value={formMetrics.targetViews}
                            onChange={(e) => setFormMetrics({ ...formMetrics, targetViews: Number(e.target.value) })}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-emerald-400 font-semibold">Aktual Views:</label>
                          <input
                            type="number"
                            value={formMetrics.actualViews}
                            onChange={(e) => setFormMetrics({ ...formMetrics, actualViews: Number(e.target.value) })}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-emerald-500/40 rounded-lg text-xs font-mono text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400">Aktual Likes:</label>
                          <input
                            type="number"
                            value={formMetrics.actualLikes}
                            onChange={(e) => setFormMetrics({ ...formMetrics, actualLikes: Number(e.target.value) })}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400">Aktual Comments:</label>
                          <input
                            type="number"
                            value={formMetrics.actualComments}
                            onChange={(e) => setFormMetrics({ ...formMetrics, actualComments: Number(e.target.value) })}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400">Aktual Saves:</label>
                          <input
                            type="number"
                            value={formMetrics.actualSaves}
                            onChange={(e) => setFormMetrics({ ...formMetrics, actualSaves: Number(e.target.value) })}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400">Aktual Shares:</label>
                          <input
                            type="number"
                            value={formMetrics.actualShares}
                            onChange={(e) => setFormMetrics({ ...formMetrics, actualShares: Number(e.target.value) })}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-300 font-semibold">Apa yang Berhasil? (What worked):</label>
                          <textarea
                            rows={2}
                            value={formMetrics.whatWorked}
                            onChange={(e) => setFormMetrics({ ...formMetrics, whatWorked: e.target.value })}
                            placeholder="Contoh: Hook POV sangat relate, jam upload 19.00 ramai..."
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 resize-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-300 font-semibold">Perlu Ditingkatkan? (What didn't work):</label>
                          <textarea
                            rows={2}
                            value={formMetrics.whatNeedsImprovement}
                            onChange={(e) => setFormMetrics({ ...formMetrics, whatNeedsImprovement: e.target.value })}
                            placeholder="Contoh: Audio musik terlalu keras, teks di slide 3 kurang terbaca..."
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 resize-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-300 font-semibold">Action Plan Konten Berikutnya:</label>
                          <textarea
                            rows={2}
                            value={formMetrics.nextActionPlan}
                            onChange={(e) => setFormMetrics({ ...formMetrics, nextActionPlan: e.target.value })}
                            placeholder="Contoh: Buat edisi Part 2 dengan format visual serupa..."
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 resize-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingContentId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEvaluation(item.id)}
                          className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                        >
                          Simpan Perubahan
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Metrics */
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                          <span className="text-[10px] text-slate-400 block">Aktual Views</span>
                          <span className="text-base font-black font-mono text-white">
                            {ev?.actualViews ? ev.actualViews.toLocaleString('id-ID') : '-'}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            Target: {ev?.targetViews?.toLocaleString('id-ID')}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                          <span className="text-[10px] text-slate-400 block">Engagement Rate</span>
                          <span className="text-base font-black font-mono text-emerald-400">
                            {ev?.engagementRate ? `${ev.engagementRate}%` : '-'}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {ev?.actualLikes || 0} Likes
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                          <span className="text-[10px] text-slate-400 block">Simpanan (Saves)</span>
                          <span className="text-base font-black font-mono text-amber-400">
                            {ev?.actualSaves ? ev.actualSaves.toLocaleString('id-ID') : '-'}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            Target: {ev?.targetSaves || 0}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                          <span className="text-[10px] text-slate-400 block">Shares (Dibagikan)</span>
                          <span className="text-base font-black font-mono text-pink-400">
                            {ev?.actualShares ? ev.actualShares.toLocaleString('id-ID') : '-'}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {ev?.actualComments || 0} Komentar
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                          <span className="text-[10px] text-slate-400 block">Klik Tautan (CTR)</span>
                          <span className="text-base font-black font-mono text-cyan-400">
                            {ev?.actualClicks ? ev.actualClicks.toLocaleString('id-ID') : '0'}
                          </span>
                          <span className="text-[10px] text-slate-500 block">Klik link bio</span>
                        </div>
                      </div>

                      {/* Qualitative Reflection */}
                      {(ev?.whatWorked || ev?.whatNeedsImprovement || ev?.nextActionPlan) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                          {ev?.whatWorked && (
                            <div className="p-3 rounded-xl bg-emerald-950/15 border border-emerald-500/20 space-y-1">
                              <span className="font-bold text-emerald-400 block">✓ Yang Berhasil:</span>
                              <p className="text-slate-300 leading-relaxed">{ev.whatWorked}</p>
                            </div>
                          )}

                          {ev?.whatNeedsImprovement && (
                            <div className="p-3 rounded-xl bg-amber-950/15 border border-amber-500/20 space-y-1">
                              <span className="font-bold text-amber-400 block">⚠️ Perlu Peningkatan:</span>
                              <p className="text-slate-300 leading-relaxed">{ev.whatNeedsImprovement}</p>
                            </div>
                          )}

                          {ev?.nextActionPlan && (
                            <div className="p-3 rounded-xl bg-indigo-950/15 border border-indigo-500/20 space-y-1">
                              <span className="font-bold text-indigo-400 block">🚀 Rencana Aksi Berikutnya:</span>
                              <p className="text-slate-300 leading-relaxed">{ev.nextActionPlan}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Post-Mortem Card */}
                  <div className="pt-3 border-t border-slate-800/80">
                    {ev?.aiAnalysis ? (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-950 border border-purple-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-bold text-purple-300">
                              Analisis Cerdas AI (Skor: {ev.aiAnalysis.scoreOutOf100}/100 • {ev.aiAnalysis.verdict})
                            </span>
                          </div>
                          <button
                            onClick={() => handleRunAiAnalysis(item)}
                            disabled={analyzingId === item.id}
                            className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 ${analyzingId === item.id ? 'animate-spin' : ''}`} />
                            <span>Analisis Ulang</span>
                          </button>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed italic">
                          "{ev.aiAnalysis.engagementAnalysis}"
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                          <div className="space-y-1">
                            <span className="font-semibold text-emerald-400">Kekuatan Utama:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                              {ev.aiAnalysis.keyStrengths?.map((str, sIdx) => (
                                <li key={sIdx}>{str}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-1">
                            <span className="font-semibold text-indigo-400">Rekomendasi Taktis AI:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                              {ev.aiAnalysis.nextContentRecommendations?.map((rec, rIdx) => (
                                <li key={rIdx}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                        <span className="text-slate-400">
                          {hasActualData
                            ? 'Dapatkan ulasan mendalam & rekomendasi strategi algoritma dari Gemini AI'
                            : 'Isi aktual views & metrik di atas untuk menjalankan analisis AI'}
                        </span>
                        <button
                          onClick={() => handleRunAiAnalysis(item)}
                          disabled={!hasActualData || analyzingId === item.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white cursor-pointer disabled:opacity-40 transition-all shadow-md shadow-purple-600/20"
                        >
                          {analyzingId === item.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Menganalisis...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span>Analisis Post-Mortem AI</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
