import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Plus, 
  Check, 
  RefreshCw, 
  Lightbulb, 
  Zap, 
  Target, 
  ListTodo, 
  Copy,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { 
  ContentPlanItem, 
  ContentPillar, 
  ContentFormat, 
  ContentPlatform, 
  ContentGoal, 
  BrandSettings 
} from '../types/content';
import { 
  getPillarBadgeColor, 
  getPlatformBadge, 
  triggerConfetti 
} from '../utils/helpers';

interface AiIdeaGeneratorViewProps {
  brandSettings: BrandSettings;
  onAddGeneratedContent: (item: ContentPlanItem) => void;
  onSwitchToPlanner: () => void;
}

export const AiIdeaGeneratorView: React.FC<AiIdeaGeneratorViewProps> = ({
  brandSettings,
  onAddGeneratedContent,
  onSwitchToPlanner,
}) => {
  // Form states
  const [niche, setNiche] = useState(brandSettings.niche);
  const [targetAudience, setTargetAudience] = useState(brandSettings.targetAudienceDescription);
  const [goal, setGoal] = useState<ContentGoal>('Brand Awareness');
  const [platform, setPlatform] = useState<ContentPlatform>('Instagram');
  const [tone, setTone] = useState(brandSettings.toneOfVoice);
  const [currentTopics, setCurrentTopics] = useState('');

  // Generation status
  const [isLoading, setIsLoading] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Hook Studio State
  const [hookTopic, setHookTopic] = useState('');
  const [isGeneratingHooks, setIsGeneratingHooks] = useState(false);
  const [hookResults, setHookResults] = useState<any | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Handle generation of 4 full content ideas
  const handleGenerateIdeas = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setAddedIds([]);

    try {
      const response = await fetch('/api/generate-content-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche,
          targetAudience,
          goal,
          platform,
          tone,
          currentTopics,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menghasilkan ide konten');
      }

      const data = await response.json();
      if (Array.isArray(data.ideas) && data.ideas.length > 0) {
        setGeneratedIdeas(data.ideas);
        triggerConfetti();
      } else {
        throw new Error('Format respon AI tidak sesuai');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat memanggil AI');
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click: Save Generated Idea to Content Plan
  const handleSaveToPlan = (idea: any, index: number) => {
    // Generate dates
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + (index + 2));
    const scheduledDate = futureDate.toISOString().split('T')[0];

    // Map suggestedTodos to ExecutionTodos
    const todos = (idea.suggestedTodos || []).map((st: any, sIdx: number) => {
      const todoDueDate = new Date(today);
      todoDueDate.setDate(today.getDate() + (st.dueDaysOffset || sIdx + 1));
      return {
        id: `td-gen-${Date.now()}-${sIdx}`,
        title: st.title || 'Tugas produksi konten',
        phase: st.phase || 'Produksi Visual',
        pic: st.pic || 'Content Creator',
        completed: false,
        dueDate: todoDueDate.toISOString().split('T')[0],
      };
    });

    const newItem: ContentPlanItem = {
      id: `cnt-${Date.now()}-${index}`,
      title: idea.title,
      pillar: (idea.pillar as ContentPillar) || 'Edukasi',
      format: (idea.format as ContentFormat) || 'Short Video (Reels/TikTok)',
      platform: (idea.platform as ContentPlatform) || platform,
      goal: (idea.goal as ContentGoal) || goal,
      targetAudience: idea.targetAudience || targetAudience,
      scheduledDate,
      scheduledTime: '19:00',
      hook: idea.hook || '',
      captionScript: idea.captionScript || '',
      callToAction: idea.captionScript?.includes('CTA') ? 'Lihat caption' : 'Komen di bawah!',
      hashtags: idea.hashtags || ['#KontenKreatif', '#SocialMediaStrategist'],
      stage: 'konten',
      status: 'Approved',
      todos,
      evaluation: {
        targetViews: idea.targetMetrics?.targetViews || 15000,
        actualViews: 0,
        targetLikes: idea.targetMetrics?.targetLikes || 1000,
        actualLikes: 0,
        targetSaves: idea.targetMetrics?.targetSaves || 300,
        actualSaves: 0,
        actualComments: 0,
        actualShares: idea.targetMetrics?.targetShares || 100,
        verdict: 'Belum Dievaluasi',
        whatWorked: '',
        whatNeedsImprovement: '',
        nextActionPlan: '',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddGeneratedContent(newItem);
    setAddedIds((prev) => [...prev, `${index}`]);
    triggerConfetti();
  };

  // Generate hook variations
  const handleGenerateHooks = async () => {
    if (!hookTopic.trim()) return;
    setIsGeneratingHooks(true);
    setHookResults(null);

    try {
      const response = await fetch('/api/generate-hooks-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: hookTopic,
          pillar: 'Edukasi',
          goal,
          format: 'Short Video (Reels/TikTok)',
          platform,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menghasilkan hook');
      }

      const data = await response.json();
      setHookResults(data);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Gagal menghasilkan hook');
    } finally {
      setIsGeneratingHooks(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/20 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              AI Content Strategist (Powered by Gemini 3.8)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Saran Konten Otomatis & Generator Ide Viral
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Dapatkan rekomendasi ide konten lengkap yang disesuaikan dengan niche brand Anda: sudah mencakup hook 3 detik pembuka, draf naskah, to-do list eksekusi terstruktur, dan target metrik evaluasi.
            </p>
          </div>

          <button
            onClick={onSwitchToPlanner}
            className="self-start md:self-auto px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
          >
            ← Kembali ke Planner
          </button>
        </div>
      </div>

      {/* Main Grid: Prompt Form & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Config Panel (4 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleGenerateIdeas}
            className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl shadow-black/20"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Zap className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-bold text-white">Parameter Kampanye</h2>
            </div>

            {/* Niche */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Niche / Industri Bisnis:
              </label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="Contoh: Fashion Muslim, Sportswear, Kedai Kopi, Tech Gadget..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Target Persona Audiens:
              </label>
              <textarea
                rows={2}
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Contoh: Gen Z usia 18-25 tahun, gemar lari santai, peka fashion & hemat..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Platform */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Platform Utama:
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as ContentPlatform)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="X / Twitter">X / Twitter</option>
                </select>
              </div>

              {/* Goal */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Tujuan Utama:
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as ContentGoal)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="Brand Awareness">Brand Awareness</option>
                  <option value="Engagement & Komunitas">Engagement</option>
                  <option value="Lead Generation">Lead Generation</option>
                  <option value="Penjualan Langsung">Penjualan Langsung</option>
                  <option value="Edukasi Pasar">Edukasi Pasar</option>
                </select>
              </div>
            </div>

            {/* Tone of Voice */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Gaya Bahasa (Tone of Voice):
              </label>
              <input
                type="text"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="Contoh: Santai, Energik, Lucu/Meme, Edukatif, Profesional..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Current topics */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Konteks / Topik Tren Khusus (Opsional):
              </label>
              <input
                type="text"
                value={currentTopics}
                onChange={(e) => setCurrentTopics(e.target.value)}
                placeholder="Contoh: Musim hujan, Promo Gajian, Event Marathon..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Meracik Ide Konten Strategis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Hasilkan 4 Ide Konten Lengkap</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Tool: Viral Hook Studio */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Viral Hook & Script Polisher</h3>
                <p className="text-[11px] text-slate-400">Punya topik mentah? Ubah jadi 3 variasi hook pemikat klik.</p>
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={hookTopic}
                onChange={(e) => setHookTopic(e.target.value)}
                placeholder="Ketik topik, contoh: Cara cuci baju jersey biar gak bau"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleGenerateHooks}
                disabled={isGeneratingHooks || !hookTopic.trim()}
                className="w-full py-2 rounded-xl text-xs font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingHooks ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                <span>Ramu 3 Variasi Hook Viral</span>
              </button>
            </div>

            {hookResults && (
              <div className="space-y-3 pt-2">
                <div className="space-y-2">
                  {hookResults.hooks?.map((h: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-amber-400 font-semibold">
                        <span>{h.type}</span>
                        <button
                          onClick={() => copyToClipboard(h.text)}
                          className="text-slate-400 hover:text-white cursor-pointer"
                        >
                          {copiedText === h.text ? 'Tersalin!' : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <p className="text-slate-200 italic font-medium">"{h.text}"</p>
                    </div>
                  ))}
                </div>

                {hookResults.scriptOutline && (
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-indigo-400">Outline Naskah (AIDA):</span>
                    <p className="text-slate-300 whitespace-pre-line text-[11px] leading-relaxed">
                      {hookResults.scriptOutline}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Generated Content Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Saran Ide Konten Tergenerasi {generatedIdeas.length > 0 && `(${generatedIdeas.length})`}
            </h2>
            {generatedIdeas.length > 0 && (
              <button
                onClick={() => {
                  generatedIdeas.forEach((idea, idx) => {
                    if (!addedIds.includes(`${idx}`)) {
                      handleSaveToPlan(idea, idx);
                    }
                  });
                }}
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
              >
                + Masukkan Semua ke Plan
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          {generatedIdeas.length === 0 && !isLoading && (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-white">Belum ada ide yang digenerate</h3>
                <p className="text-xs text-slate-400">
                  Klik tombol <strong>"Hasilkan 4 Ide Konten Lengkap"</strong> di panel sebelah kiri untuk meminta AI menyusun strategi dan rencana konten siap eksekusi.
                </p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-3 animate-pulse">
                  <div className="flex gap-2">
                    <div className="w-16 h-5 bg-slate-800 rounded-full" />
                    <div className="w-20 h-5 bg-slate-800 rounded-full" />
                  </div>
                  <div className="w-3/4 h-5 bg-slate-800 rounded" />
                  <div className="w-full h-12 bg-slate-800/60 rounded" />
                </div>
              ))}
            </div>
          )}

          {generatedIdeas.map((idea, idx) => {
            const isAdded = addedIds.includes(`${idx}`);
            const isExpanded = expandedIndex === idx;
            const pillarColor = getPillarBadgeColor(idea.pillar);
            const platformBadge = getPlatformBadge(idea.platform || platform);

            return (
              <div
                key={idx}
                className={`rounded-2xl bg-slate-900/80 border transition-all ${
                  isAdded ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800 hover:border-purple-500/40'
                } p-5 space-y-4 shadow-lg shadow-black/20`}
              >
                {/* Badges & Actions */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${pillarColor.bg} ${pillarColor.text} ${pillarColor.border}`}>
                      {idea.pillar}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${platformBadge.color}`}>
                      {idea.platform || platform}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {idea.format}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSaveToPlan(idea, idx)}
                    disabled={isAdded}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                      isAdded
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersimpan di Plan</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Masukkan ke Plan</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Title & Goal */}
                <div>
                  <h3 className="text-base font-bold text-white leading-snug">
                    {idea.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                    <Target className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Tujuan: <strong className="text-slate-300">{idea.goal}</strong></span>
                  </div>
                </div>

                {/* Hook Box */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    <span>⚡ Viral Hook (3 Detik Pertama):</span>
                    <button
                      onClick={() => copyToClipboard(idea.hook)}
                      className="text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {copiedText === idea.hook ? 'Tersalin' : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-200 italic font-medium">
                    "{idea.hook}"
                  </p>
                </div>

                {/* To-Do Eksekusi Preview */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <ListTodo className="w-3.5 h-3.5 text-amber-400" />
                      Checklist Eksekusi ({idea.suggestedTodos?.length || 0} Task):
                    </span>
                    <button
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer"
                    >
                      {isExpanded ? (
                        <>Tutup Detail <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>Lihat Naskah & Task <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {idea.suggestedTodos?.slice(0, 3).map((st: any, sIdx: number) => (
                      <span
                        key={sIdx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400"
                      >
                        ✓ {st.title} ({st.pic})
                      </span>
                    ))}
                    {(idea.suggestedTodos?.length || 0) > 3 && (
                      <span className="text-[10px] text-slate-500 self-center">
                        +{idea.suggestedTodos.length - 3} lainnya
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Details: Caption & Todos & Metrics */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-300">Draft Naskah / Caption:</span>
                      <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 whitespace-pre-line leading-relaxed">
                        {idea.captionScript}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Target Views</span>
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {idea.targetMetrics?.targetViews?.toLocaleString('id-ID') || '15.000'}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Target Likes</span>
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {idea.targetMetrics?.targetLikes?.toLocaleString('id-ID') || '900'}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Target Saves</span>
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {idea.targetMetrics?.targetSaves?.toLocaleString('id-ID') || '350'}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Target Shares</span>
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {idea.targetMetrics?.targetShares?.toLocaleString('id-ID') || '120'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
