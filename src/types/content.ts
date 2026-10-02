export type ContentPillar =
  | 'Edukasi'
  | 'Promosi'
  | 'Hiburan'
  | 'Inspirasi'
  | 'Behind the Scenes'
  | 'Interaksi';

export type ContentFormat =
  | 'Short Video (Reels/TikTok)'
  | 'Carousel'
  | 'Single Post'
  | 'Thread / Teks'
  | 'Long Video / YouTube'
  | 'Story / Live';

export type ContentPlatform =
  | 'Instagram'
  | 'TikTok'
  | 'YouTube'
  | 'LinkedIn'
  | 'X / Twitter'
  | 'Facebook';

export type ContentGoal =
  | 'Brand Awareness'
  | 'Engagement & Komunitas'
  | 'Lead Generation'
  | 'Penjualan Langsung'
  | 'Edukasi Pasar'
  | 'Traffic Website';

export type ContentStage = 'konten' | 'eksekusi' | 'evaluasi';

export type ExecutionStatus =
  | 'Draft'
  | 'Approved'
  | 'In Production'
  | 'In Review'
  | 'Ready to Publish'
  | 'Published';

export type EvaluationVerdict =
  | 'Belum Dievaluasi'
  | 'Melebihi Target'
  | 'Mencapai Target'
  | 'Perlu Optimasi';

export type TodoPhase =
  | 'Riset & Naskah'
  | 'Produksi Visual'
  | 'Editing & Aset'
  | 'Review & Approval'
  | 'Distribusi & Publish';

export interface ExecutionTodo {
  id: string;
  title: string;
  phase: TodoPhase;
  pic: string;
  completed: boolean;
  dueDate?: string;
  notes?: string;
}

export interface AiEvaluationAnalysis {
  verdict: string;
  scoreOutOf100: number;
  engagementAnalysis: string;
  keyStrengths: string[];
  bottlenecks: string[];
  nextContentRecommendations: string[];
  analyzedAt: string;
}

export interface ContentEvaluation {
  publishDate?: string;
  postUrl?: string;
  targetViews: number;
  actualViews: number;
  targetLikes: number;
  actualLikes: number;
  targetSaves: number;
  actualSaves: number;
  targetShares?: number;
  actualComments: number;
  actualShares: number;
  actualClicks?: number;
  engagementRate?: number;
  verdict: EvaluationVerdict;
  whatWorked: string;
  whatNeedsImprovement: string;
  nextActionPlan: string;
  aiAnalysis?: AiEvaluationAnalysis;
}

export interface ContentPlanItem {
  id: string;
  title: string;
  pillar: ContentPillar;
  format: ContentFormat;
  platform: ContentPlatform;
  goal: ContentGoal;
  targetAudience: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime?: string;
  hook: string;
  captionScript: string;
  callToAction: string;
  hashtags: string[];
  assetLinks?: string; // drive/canva link
  
  // Alur terpadu status
  stage: ContentStage; // 'konten' -> 'eksekusi' -> 'evaluasi'
  status: ExecutionStatus;
  
  // Eksekusi To-Do List
  todos: ExecutionTodo[];
  
  // Evaluasi Metrik & Pembelajaran
  evaluation?: ContentEvaluation;

  createdAt: string;
  updatedAt: string;
}

export interface BrandSettings {
  brandName: string;
  niche: string;
  targetAudienceDescription: string;
  toneOfVoice: string;
  teamMembers: { id: string; name: string; role: string }[];
  defaultPlatforms: ContentPlatform[];
}
