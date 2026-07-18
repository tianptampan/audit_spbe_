import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Endpoint to analyze a single audit item (Indicator)
app.post("/api/audit/analyze-item", async (req, res) => {
  try {
    const { indicator, score, actualCondition, evidence } = req.body;

    if (!indicator) {
      return res.status(400).json({ error: "Indikator audit harus diisi." });
    }

    const prompt = `
Anda adalah seorang Auditor SPBE (Sistem Pemerintahan Berbasis Elektronik) Profesional dan Ahli Tata Kelola IT Pemerintahan di Indonesia.
Berikan analisis audit objektif berdasarkan data berikut:
- Indikator Audit: "${indicator}"
- Skor Penilaian (1-5): ${score || 3}/5
- Kondisi Aktual: "${actualCondition || "Belum diisi"}"
- Bukti / Evidence: "${evidence || "Belum dilampirkan"}"

Tugas Anda adalah memformulasikan bagian "Temuan" dan "Rekomendasi" dalam Bahasa Indonesia yang formal, taktis, konstruktif, dan sesuai dengan standar evaluasi SPBE (seperti Peraturan Menteri PANRB No. 59 Tahun 2020 atau Perpres No. 95 Tahun 2018).

Format jawaban harus berupa JSON yang valid dengan properti berikut:
{
  "temuan": "Deskripsi terperinci mengenai temuan audit yang objektif dan jelas, menyebutkan apa yang kurang atau apa yang sudah baik sesuai dengan skor.",
  "rekomendasi": "Rekomendasi langkah perbaikan konkret yang harus diambil oleh instansi/pemda, termasuk rujukan kebijakan jika relevan, disesuaikan dengan tingkat keparahan skor."
}

Pastikan respons Anda HANYA berupa JSON valid tanpa markdown block, tanpa penjelasan tambahan di luar JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            temuan: { type: Type.STRING },
            rekomendasi: { type: Type.STRING },
          },
          required: ["temuan", "rekomendasi"],
        },
      },
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText.trim());
    return res.json(data);
  } catch (error: any) {
    console.error("Error in /api/audit/analyze-item:", error);
    return res.status(500).json({
      error: "Gagal menganalisis indikator menggunakan AI.",
      details: error.message,
    });
  }
});

// Endpoint to sync projects to a Google Sheet via a configurable Apps Script webhook
app.post("/api/google-sheets/sync", async (req, res) => {
  try {
    const { projects, projectId } = req.body;
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

    if (!webhookUrl) {
      return res.status(400).json({
        error: "Google Sheets webhook belum dikonfigurasi. Setel GOOGLE_SHEETS_WEBHOOK_URL di file .env.",
      });
    }

    const payload = {
      source: "audit_spbe",
      exportedAt: new Date().toISOString(),
      projectId: projectId ?? null,
      projects: Array.isArray(projects) ? projects : [],
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return res.status(502).json({
        error: "Gagal mengirim data ke Google Sheets.",
        details: responseText,
      });
    }

    return res.json({
      message: "Data berhasil disinkronkan ke Google Sheets.",
      exportedCount: payload.projects.length,
      response: responseText,
    });
  } catch (error: any) {
    console.error("Error in /api/google-sheets/sync:", error);
    return res.status(500).json({
      error: "Gagal menyinkronkan data ke Google Sheets.",
      details: error.message,
    });
  }
});

// Endpoint to summarize the entire SPBE Audit Project
app.post("/api/audit/summarize", async (req, res) => {
  try {
    const { projectName, url, description, answers } = req.body;

    if (!projectName || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Data audit tidak lengkap." });
    }

    const auditDataString = answers
      .map(
        (ans, idx) => `
${idx + 1}. Indikator: "${ans.indicator}"
   Skor: ${ans.score}/5
   Kondisi Aktual: "${ans.actualCondition || "Tidak diisi"}"
   Evidence: "${ans.evidence || "Tidak dilampirkan"}"
   Temuan: "${ans.temuan || "Tidak ada temuan khusus"}"
   Rekomendasi: "${ans.rekomendasi || "Tidak ada rekomendasi khusus"}"`
      )
      .join("\n");

    const prompt = `
Anda adalah Kepala Tim Auditor SPBE Nasional di bawah Kementerian PANRB / Badan Siber dan Sandi Negara (BSSN).
Anda ditugaskan untuk menyusun Laporan Ringkasan Eksekutif Hasil Evaluasi SPBE untuk aplikasi/portal berikut:
- Nama Aplikasi/Portal: "${projectName}"
- URL / Domain: "${url || "Tidak ditentukan"}"
- Deskripsi Singkat: "${description || "Tidak ditentukan"}"

Berikut adalah data penilaian mendetail dari setiap indikator:
${auditDataString}

Buatlah laporan ringkasan eksekutif formal yang komprehensif, objektif, dan berorientasi pada peningkatan kapasitas pelayanan publik elektronik sesuai regulasi SPBE di Indonesia.

Format respons harus berupa JSON yang valid dengan skema berikut:
{
  "executiveSummary": "Teks paragraf ringkasan eksekutif yang formal, berwibawa, menggambarkan kondisi umum kematangan SPBE aplikasi ini, serta urgensi perbaikan secara keseluruhan.",
  "keyStrengths": ["Daftar 2-3 kelebihan utama atau aspek yang sudah sangat baik berdasarkan skor tinggi"],
  "keyWeaknesses": ["Daftar 2-3 kelemahan kritis atau celah yang harus segera ditutup berdasarkan skor rendah"],
  "spbeIndexLevel": "Predikat indeks kematangan SPBE, pilih salah satu yang paling menggambarkan rata-rata skor: 'Sangat Kurang' (rata-rata < 1.8), 'Kurang' (1.8 - 2.5), 'Cukup' (2.6 - 3.4), 'Baik' (3.5 - 4.1), 'Sangat Baik' (4.2 - 5.0)",
  "priorityActionPlan": [
    {
      "action": "Nama rencana aksi taktis (misal: 'Migrasi Domain ke .go.id')",
      "priority": "Pilih: 'Tinggi' | 'Sedang' | 'Rendah'",
      "description": "Penjelasan detail mengenai langkah koordinasi, teknologi, atau regulasi yang harus ditempuh segera."
    }
  ]
}

Pastikan respons Anda HANYA berupa JSON valid tanpa markdown block, tanpa penjelasan tambahan di luar JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            keyStrengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            keyWeaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            spbeIndexLevel: { type: Type.STRING },
            priorityActionPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  action: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ["action", "priority", "description"],
              },
            },
          },
          required: [
            "executiveSummary",
            "keyStrengths",
            "keyWeaknesses",
            "spbeIndexLevel",
            "priorityActionPlan",
          ],
        },
      },
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText.trim());
    return res.json(data);
  } catch (error: any) {
    console.error("Error in /api/audit/summarize:", error);
    return res.status(500).json({
      error: "Gagal menyusun ringkasan eksekutif menggunakan AI.",
      details: error.message,
    });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
