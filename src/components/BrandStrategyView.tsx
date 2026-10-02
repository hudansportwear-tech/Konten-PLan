import React, { useState } from 'react';
import { 
  Compass, 
  Users, 
  Save, 
  Plus, 
  Trash2, 
  Layers, 
  Sparkles, 
  Check, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { BrandSettings } from '../types/content';
import { triggerConfetti } from '../utils/helpers';

interface BrandStrategyViewProps {
  brandSettings: BrandSettings;
  onSaveBrandSettings: (settings: BrandSettings) => void;
}

export const BrandStrategyView: React.FC<BrandStrategyViewProps> = ({
  brandSettings,
  onSaveBrandSettings,
}) => {
  const [brandName, setBrandName] = useState(brandSettings.brandName);
  const [niche, setNiche] = useState(brandSettings.niche);
  const [targetAudienceDescription, setTargetAudienceDescription] = useState(
    brandSettings.targetAudienceDescription
  );
  const [toneOfVoice, setToneOfVoice] = useState(brandSettings.toneOfVoice);
  const [teamMembers, setTeamMembers] = useState(brandSettings.teamMembers);

  // New member form
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Content Creator');
  const [isSaved, setIsSaved] = useState(false);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    setTeamMembers((prev) => [
      ...prev,
      {
        id: `tm-${Date.now()}`,
        name: `${newMemberName.trim()} (${newMemberRole})`,
        role: newMemberRole,
      },
    ]);
    setNewMemberName('');
  };

  const handleRemoveMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveAll = () => {
    const updated: BrandSettings = {
      ...brandSettings,
      brandName,
      niche,
      targetAudienceDescription,
      toneOfVoice,
      teamMembers,
    };
    onSaveBrandSettings(updated);
    setIsSaved(true);
    triggerConfetti();
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <Compass className="w-3.5 h-3.5" />
              Fondasi Strategi Brand & Pilar Konten
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pengaturan Profil Brand & Tim Produksi
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Tentukan arah identitas brand, target persona audiens, serta daftar anggota tim PIC eksekusi agar pembagian to-do list berjalan terarah dan harmonis.
            </p>
          </div>

          <button
            onClick={handleSaveAll}
            className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 cursor-pointer transition-all"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Berhasil Disimpan!' : 'Simpan Pengaturan'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Brand Profile & Team (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Brand Info Card */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Profil Brand & Identitas Konten
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Nama Brand / Akun:
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Niche & Industri:
              </label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Target Persona Audiens Utama:
              </label>
              <textarea
                rows={3}
                value={targetAudienceDescription}
                onChange={(e) => setTargetAudienceDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Tone of Voice (Gaya Bahasa):
              </label>
              <input
                type="text"
                value={toneOfVoice}
                onChange={(e) => setToneOfVoice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Team PIC Manager */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Users className="w-4 h-4 text-amber-400" />
              Daftar Tim PIC Eksekusi Konten
            </h2>

            {/* Add member form */}
            <form onSubmit={handleAddMember} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Nama anggota (contoh: Sarah)"
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200"
              >
                <option value="Scriptwriter">Scriptwriter</option>
                <option value="Graphic Designer">Graphic Designer</option>
                <option value="Videographer">Videographer</option>
                <option value="Video Editor">Video Editor</option>
                <option value="Social Media">Social Media</option>
                <option value="Creative Director">Creative Director</option>
              </select>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 cursor-pointer shrink-0"
              >
                + Tambah Anggota
              </button>
            </form>

            {/* Members List */}
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{member.name}</p>
                      <span className="text-[10px] text-amber-400">{member.role}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Info: Strategic Matrix & Best Practices (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Panduan 6 Pilar Konten Plan
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 space-y-1">
                <span className="font-bold text-blue-400">1. Edukasi (40% Porsi Ideal)</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Tips, tutorial, bedah mitos, dan panduan teknis. Membangun otoritas dan trust tertinggi sebelum orang membeli.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1">
                <span className="font-bold text-amber-400">2. Hiburan / Relatable (25% Porsi)</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Meme industri, sudut pandang (POV), situasi lucu keseharian. Pembawa viral share loop organik terbaik.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                <span className="font-bold text-emerald-400">3. Promosi / Konversi (20% Porsi)</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Produk showcase, diskon terbatas, fitur unggulan, dan testimoni pelanggan yang memicu checkout langsung.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-1">
                <span className="font-bold text-cyan-400">4. Behind The Scenes (10% Porsi)</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Proses produksi, uji coba produk, kerja tim. Menghidupkan sentuhan manusiawi (human touch) brand.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-1">
                <span className="font-bold text-purple-400">5. Inspirasi & Komunitas (5% Porsi)</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Kisah transformasi, quotes motivasi, sesi Q&A, dan tantangan audiens.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-tr from-indigo-950/50 to-slate-900 border border-indigo-500/20 space-y-2 text-xs">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Siklus Emas: Rencana → Eksekusi → Evaluasi
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Jangan biarkan konten berhenti di rencana. Ketika To-Do selesai dan konten tayang, selalu masukkan metrik kinerja di tab <strong>Evaluasi</strong>. Analisis AI akan memberikan pola agar konten minggu depan selalu lebih baik!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
