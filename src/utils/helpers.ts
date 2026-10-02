import confetti from 'canvas-confetti';
import { ContentPillar, ContentPlatform, ContentStage, ExecutionStatus } from '../types/content';

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function triggerConfetti() {
  try {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'],
    });
  } catch (e) {
    console.error('Confetti error', e);
  }
}

export function getPillarBadgeColor(pillar: ContentPillar): { bg: string; text: string; border: string } {
  switch (pillar) {
    case 'Edukasi':
      return { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' };
    case 'Promosi':
      return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    case 'Hiburan':
      return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
    case 'Inspirasi':
      return { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' };
    case 'Behind the Scenes':
      return { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' };
    case 'Interaksi':
      return { bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/30' };
    default:
      return { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' };
  }
}

export function getPlatformBadge(platform: ContentPlatform): { color: string; label: string } {
  switch (platform) {
    case 'Instagram':
      return { color: 'text-pink-400 bg-pink-500/10 border-pink-500/20', label: 'Instagram' };
    case 'TikTok':
      return { color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', label: 'TikTok' };
    case 'YouTube':
      return { color: 'text-red-400 bg-red-500/10 border-red-500/20', label: 'YouTube' };
    case 'LinkedIn':
      return { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', label: 'LinkedIn' };
    case 'X / Twitter':
      return { color: 'text-slate-200 bg-slate-500/10 border-slate-500/20', label: 'X (Twitter)' };
    case 'Facebook':
      return { color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', label: 'Facebook' };
    default:
      return { color: 'text-slate-300 bg-slate-800 border-slate-700', label: platform };
  }
}

export function getStageDetails(stage: ContentStage): {
  label: string;
  desc: string;
  badgeClass: string;
  stepNum: number;
} {
  switch (stage) {
    case 'konten':
      return {
        label: '1. Rencana Konten',
        desc: 'Ide, pilar, hook & naskah',
        badgeClass: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        stepNum: 1,
      };
    case 'eksekusi':
      return {
        label: '2. Eksekusi Produksi',
        desc: 'Checklist to-do, syuting & edit',
        badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        stepNum: 2,
      };
    case 'evaluasi':
      return {
        label: '3. Evaluasi Kinerja',
        desc: 'Metrik aktual & refleksi hasil',
        badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        stepNum: 3,
      };
  }
}

export function getStatusBadge(status: ExecutionStatus): { label: string; badgeClass: string } {
  switch (status) {
    case 'Draft':
      return { label: 'Draft Ide', badgeClass: 'bg-slate-700 text-slate-300 border-slate-600' };
    case 'Approved':
      return { label: 'Disetujui', badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    case 'In Production':
      return { label: 'Dalam Produksi', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    case 'In Review':
      return { label: 'Sedang Direview', badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    case 'Ready to Publish':
      return { label: 'Siap Publish', badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/30' };
    case 'Published':
      return { label: 'Telah Tayang', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
  }
}

export function calculateEngagementRate(
  views: number,
  likes: number,
  comments: number,
  shares: number,
  saves: number
): number {
  if (!views || views <= 0) return 0;
  const totalEngagements = (likes || 0) + (comments || 0) + (shares || 0) + (saves || 0);
  return Number(((totalEngagements / views) * 100).toFixed(2));
}
