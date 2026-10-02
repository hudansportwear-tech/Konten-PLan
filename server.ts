import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Persistent Storage Directories
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const CONTENT_FILE = path.join(DATA_DIR, 'content-store.json');
const BRAND_FILE = path.join(DATA_DIR, 'brand-store.json');

// Persistent Online Cloud Storage API
app.get('/api/storage/content', (req, res) => {
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));
      return res.json({ items: data });
    }
    return res.json({ items: null });
  } catch (err: any) {
    console.error('Error reading content store:', err);
    return res.status(500).json({ error: 'Gagal membaca data server' });
  }
});

app.post('/api/storage/content', (req, res) => {
  try {
    const { items } = req.body;
    if (Array.isArray(items)) {
      fs.writeFileSync(CONTENT_FILE, JSON.stringify(items, null, 2), 'utf-8');
      return res.json({ success: true, count: items.length });
    }
    return res.status(400).json({ error: 'Data items harus berupa array' });
  } catch (err: any) {
    console.error('Error writing content store:', err);
    return res.status(500).json({ error: 'Gagal menyimpan data ke server' });
  }
});

app.get('/api/storage/brand', (req, res) => {
  try {
    if (fs.existsSync(BRAND_FILE)) {
      const data = JSON.parse(fs.readFileSync(BRAND_FILE, 'utf-8'));
      return res.json({ brand: data });
    }
    return res.json({ brand: null });
  } catch (err: any) {
    console.error('Error reading brand store:', err);
    return res.status(500).json({ error: 'Gagal membaca pengaturan brand server' });
  }
});

app.post('/api/storage/brand', (req, res) => {
  try {
    const { brand } = req.body;
    if (brand && typeof brand === 'object') {
      fs.writeFileSync(BRAND_FILE, JSON.stringify(brand, null, 2), 'utf-8');
      return res.json({ success: true });
    }
    return res.status(400).json({ error: 'Data brand tidak valid' });
  } catch (err: any) {
    console.error('Error writing brand store:', err);
    return res.status(500).json({ error: 'Gagal menyimpan pengaturan brand ke server' });
  }
});

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(apiKey) });
});

// API: Generate Content Ideas
app.post('/api/generate-content-ideas', async (req, res) => {
  try {
    const { niche, targetAudience, goal, platform, tone, currentTopics } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'API Gemini belum dikonfigurasi. Pastikan GEMINI_API_KEY tersedia.',
      });
    }

    const prompt = `Anda adalah seorang Content Strategist & Social Media Director kelas dunia berbahasa Indonesia.
Buat 4 ide rencana konten yang sangat kreatif, terstruktur, berpotensi viral, dan memiliki tingkat konversi tinggi.

Parameter Kampanye:
- Niche/Industri: ${niche || 'Fashion & Sportswear'}
- Target Audiens: ${targetAudience || 'Gen Z dan Milenial aktif usia 20-35 tahun'}
- Tujuan Utama: ${goal || 'Meningkatkan Engagement & Konversi Penjualan'}
- Platform Utama: ${platform || 'Instagram & TikTok'}
- Tone of Voice: ${tone || 'Energik, Edukatif, Relatable, dan Inspiratif'}
- Topik/Konteks Tambahan: ${currentTopics || 'Tren gaya hidup sehat, tips memilih outfit olahraga nyaman'}

Outputkan HANYA dalam format JSON valid (array of objects), tanpa markdown code fence seperti \`\`\`json. Setiap objek konten harus mengikuti struktur persis berikut:
[
  {
    "title": "Judul konten yang menggugah rasa ingin tahu",
    "pillar": "Edukasi" | "Promosi" | "Hiburan" | "Inspirasi" | "Behind the Scenes" | "Interaksi",
    "format": "Short Video (Reels/TikTok)" | "Carousel" | "Single Post" | "Thread" | "Long Video",
    "platform": "Instagram" | "TikTok" | "YouTube" | "LinkedIn" | "X / Twitter",
    "goal": "Brand Awareness" | "Engagement" | "Lead Generation" | "Penjualan Langsung" | "Edukasi Pasar",
    "targetAudience": "Deskripsi singkat target audiens untuk konten ini",
    "hook": "Kalimat pembuka 3 detik pertama / Headline penarik perhatian",
    "captionScript": "Draft naskah video atau caption lengkap yang menarik beserta Call To Action (CTA) jelas",
    "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4"],
    "suggestedTodos": [
      { "title": "Riset materi & perbandingan produk", "phase": "Riset & Naskah", "pic": "Scriptwriter", "dueDaysOffset": 1 },
      { "title": "Pembuatan draft script & storyboard", "phase": "Riset & Naskah", "pic": "Scriptwriter", "dueDaysOffset": 2 },
      { "title": "Syuting footage hook & visual demo", "phase": "Produksi Visual", "pic": "Videografer", "dueDaysOffset": 3 },
      { "title": "Editing video, teks subtitle dinamis & backsound", "phase": "Editing & Aset", "pic": "Video Editor", "dueDaysOffset": 4 },
      { "title": "Review final & persetujuan", "phase": "Review & Approval", "pic": "Content Lead", "dueDaysOffset": 4 },
      { "title": "Posting pada prime time & interaksi 1 jam pertama", "phase": "Distribusi & Publish", "pic": "Social Media Specialist", "dueDaysOffset": 5 }
    ],
    "targetMetrics": {
      "targetViews": 15000,
      "targetLikes": 900,
      "targetSaves": 350,
      "targetShares": 120
    }
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '[]';
    let ideas;
    try {
      ideas = JSON.parse(rawText);
    } catch {
      // Clean possible wrapper if any
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      ideas = JSON.parse(cleaned);
    }

    return res.json({ ideas });
  } catch (error: any) {
    console.error('Error generating content ideas:', error);
    return res.status(500).json({ error: error.message || 'Gagal membuat ide konten' });
  }
});

// API: Generate Hook Variations & Script Polish
app.post('/api/generate-hooks-script', async (req, res) => {
  try {
    const { title, pillar, goal, format, platform } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'API Gemini belum dikonfigurasi. Pastikan GEMINI_API_KEY tersedia.',
      });
    }

    const prompt = `Anda adalah ahli copywriting viral dan video retention strategist.
Untuk topik konten berikut:
- Judul: "${title}"
- Pilar: "${pillar}"
- Tujuan: "${goal}"
- Format: "${format}"
- Platform: "${platform}"

Buatlah:
1. Tiga opsi Hook pembuka (1: Kontroversial/Patahkan Mitos, 2: Rasa Penasaran/Storytelling, 3: Direct Value/Solusi Cepat)
2. Struktur Naskah / Body Copywriting (Format AIDA: Attention, Interest, Desire, Action)
3. 2 variasi Call to Action (CTA) kuat
4. Saran visual/audio (B-roll, transisi, tone musik)

Keluarkan dalam format JSON:
{
  "hooks": [
    { "type": "Patahkan Mitos / Kontroversial", "text": "..." },
    { "type": "Storytelling / Curiosity Gap", "text": "..." },
    { "type": "Direct Value & Solusi", "text": "..." }
  ],
  "scriptOutline": "...",
  "callToActions": ["...", "..."],
  "visualAudioTips": "..."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let result;
    try {
      result = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      result = JSON.parse(cleaned);
    }

    return res.json(result);
  } catch (error: any) {
    console.error('Error generating hook/script:', error);
    return res.status(500).json({ error: error.message || 'Gagal menghasilkan hook' });
  }
});

// API: Analyze Evaluation Post-Mortem
app.post('/api/analyze-evaluation', async (req, res) => {
  try {
    const { title, pillar, format, platform, targetViews, actualViews, actualLikes, actualComments, actualShares, actualSaves, actualClicks, whatWorked, whatNeedsImprovement } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'API Gemini belum dikonfigurasi. Pastikan GEMINI_API_KEY tersedia.',
      });
    }

    const prompt = `Analisis hasil performa konten sosial media berikut sebagai Senior Social Media Analyst:

Detail Konten:
- Judul: "${title}"
- Pilar: "${pillar}"
- Format: "${format}" (${platform})
- Target Views: ${targetViews} vs Aktual Views: ${actualViews}
- Likes: ${actualLikes}
- Comments: ${actualComments}
- Shares: ${actualShares}
- Saves: ${actualSaves}
- Clicks: ${actualClicks || 0}
- Catatan Tim - Apa yang Berhasil: "${whatWorked || '-'}"
- Catatan Tim - Perlu Ditingkatkan: "${whatNeedsImprovement || '-'}"

Berikan analisis post-mortem yang tajam, objektif, dan berorientasi hasil dalam format JSON:
{
  "verdict": "Sangat Sukses" | "Sesuai Ekspektasi" | "Perlu Penyesuaian Strategi" | "Kurang Memuaskan",
  "scoreOutOf100": 85,
  "engagementAnalysis": "Penjelasan ringkas tentang rasio saves/shares/comments terhadap views dan apa artinya bagi algoritma platform ini",
  "keyStrengths": ["Kekuatan 1", "Kekuatan 2"],
  "bottlenecks": ["Kendala/kelemahan 1", "Kendala/kelemahan 2"],
  "nextContentRecommendations": [
    "Rekomendasi taktis 1 untuk konten berikutnya",
    "Rekomendasi taktis 2 untuk konten berikutnya",
    "Rekomendasi taktis 3 untuk konten berikutnya"
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let result;
    try {
      result = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      result = JSON.parse(cleaned);
    }

    return res.json(result);
  } catch (error: any) {
    console.error('Error analyzing evaluation:', error);
    return res.status(500).json({ error: error.message || 'Gagal menganalisis evaluasi' });
  }
});

// Setup Vite Dev Server or Production Static Serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PlanCraft Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
