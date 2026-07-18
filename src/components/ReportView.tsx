import React, { useState } from "react";
import { 
  ArrowLeft, Printer, Download, Sparkles, AlertCircle, 
  CheckCircle2, Flame, RefreshCw, FileSpreadsheet, Copy, Check 
} from "lucide-react";
import { AuditProject, AISummary } from "../types";

interface ReportViewProps {
  project: AuditProject;
  onBackToDashboard: () => void;
  onBackToEdit: () => void;
  onUpdateAISummary: (summary: AISummary) => void;
}

export default function ReportView({
  project,
  onBackToDashboard,
  onBackToEdit,
  onUpdateAISummary,
}: ReportViewProps) {
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [copied, setCopied] = useState(false);

  // Calculate final SPBE Index Score
  const totalScore = project.answers.reduce((acc, curr) => acc + curr.score, 0);
  const averageScore = (totalScore / project.answers.length);
  const averageScoreStr = averageScore.toFixed(2);

  // Qualitative SPBE ratings
  const getSPBERating = (score: number) => {
    if (score >= 4.2) return { label: "Sangat Baik", color: "text-[#1ab346]", border: "border-[#1ab346]", bg: "bg-[#e2f9e9]" };
    if (score >= 3.5) return { label: "Baik", color: "text-[#0066cc]", border: "border-[#0066cc]", bg: "bg-[#e1f0ff]" };
    if (score >= 2.6) return { label: "Cukup", color: "text-[#ff9500]", border: "border-[#ff9500]", bg: "bg-[#fff2e0]" };
    if (score >= 1.8) return { label: "Kurang", color: "text-[#ff3b30]", border: "border-[#ff3b30]", bg: "bg-[#fbe8ea]" };
    return { label: "Sangat Kurang", color: "text-gray-500", border: "border-gray-300", bg: "bg-gray-100" };
  };

  const rating = getSPBERating(averageScore);

  // SVG Gauge calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (averageScore / 5) * circumference;

  // Compile Executive Summary using AI
  const compileAISummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch("/api/audit/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: project.projectName,
          url: project.url,
          description: project.description,
          answers: project.answers,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal menyusun ringkasan eksekutif.");
      }

      const summaryData = await res.json();
      onUpdateAISummary(summaryData);
    } catch (error) {
      alert("Terjadi kesalahan saat menyusun Ringkasan Eksekutif AI. Silakan coba beberapa saat lagi.");
      console.error(error);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Copy report summary to clipboard
  const handleCopyText = () => {
    if (!project.aiSummary) return;
    const textToCopy = `
LAPORAN EVALUASI KEMATANGAN SPBE
Nama Portal: ${project.projectName}
URL: ${project.url || "-"}
Auditor: ${project.auditorName}
Tanggal: ${project.auditDate}
Indeks SPBE: ${averageScoreStr}/5.00 (${rating.label})

RINGKASAN EKSEKUTIF:
${project.aiSummary.executiveSummary}

REKOMENDASI PRIORITAS:
${project.aiSummary.priorityActionPlan.map((p, i) => `${i+1}. [Prio: ${p.priority}] ${p.action} - ${p.description}`).join("\n")}
    `;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export Table to CSV
  const handleExportCSV = () => {
    const headers = ["No", "Indikator Audit", "Kondisi Aktual", "Evidence", "Skor", "Temuan", "Rekomendasi"];
    const rows = project.answers.map((ans, idx) => [
      (idx + 1).toString(),
      ans.indicator.replace(/"/g, '""'),
      ans.actualCondition.replace(/"/g, '""'),
      ans.evidence.replace(/"/g, '""'),
      ans.score.toString(),
      ans.finding,
      ans.rekomendasi.replace(/"/g, '""')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Audit_SPBE_${project.projectName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#e8e8ed] no-print">
        <div className="flex items-center gap-3">
          <button
            id="back-to-dashboard-btn"
            onClick={onBackToDashboard}
            className="p-2 rounded-full hover:bg-[#f5f5f7] text-[#86868b] hover:text-[#1d1d1f] transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Hasil Audit Resmi</span>
            <h2 className="text-xl font-bold text-[#1d1d1f] tracking-tight">Laporan Evaluasi SPBE</h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            id="btn-edit-answers"
            onClick={onBackToEdit}
            className="px-4 py-2 text-xs font-medium bg-white text-[#1d1d1f] border border-[#e8e8ed] hover:bg-[#f5f5f7] active:bg-gray-100 rounded-xl transition-all shadow-sm"
          >
            Edit Kertas Kerja
          </button>

          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="px-4 py-2 text-xs font-medium bg-white text-[#1d1d1f] border border-[#e8e8ed] hover:bg-[#f5f5f7] active:bg-gray-100 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <FileSpreadsheet size={14} className="text-[#1ab346]" />
            Ekspor CSV
          </button>

          <button
            id="btn-print-report"
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold bg-[#0066cc] hover:bg-[#0077ed] text-white active:bg-[#0055b3] rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Printer size={14} />
            Cetak / PDF
          </button>
        </div>
      </div>

      {/* Main printable paper container */}
      <div className="bg-white rounded-3xl border border-[#e8e8ed] shadow-lg overflow-hidden p-6 md:p-8 space-y-8 print-card">
        
        {/* Printable Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-[#f5f5f7] pb-6">
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#0066cc] tracking-widest uppercase">Kertas Kerja Hasil Audit</div>
            <h1 className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight">{project.projectName}</h1>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-[#86868b] pt-1.5">
              <div><span className="font-semibold text-gray-500">Domain Website:</span> {project.url || "-"}</div>
              <div><span className="font-semibold text-gray-500">Tanggal Audit:</span> {project.auditDate}</div>
              <div><span className="font-semibold text-gray-500">Evaluator / Auditor:</span> {project.auditorName}</div>
              <div><span className="font-semibold text-gray-500">Status:</span> Selesai</div>
            </div>
          </div>

          {/* Large Ring Gauge Index Score */}
          <div className="flex items-center gap-4 bg-[#f5f5f7] p-4 rounded-2xl border border-[#e8e8ed] self-stretch md:self-auto justify-center md:justify-start">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  className="stroke-[#e8e8ed]"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Active Segment */}
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  className="stroke-[#0066cc]"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              {/* Inner score label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-[#1d1d1f] tracking-tight">{averageScoreStr}</span>
                <span className="text-[10px] text-[#86868b] uppercase font-bold tracking-wider">Skor SPBE</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest">Tingkat Kematangan</div>
              <div className={`text-lg font-bold mt-0.5 ${rating.color}`}>{rating.label}</div>
              <div className="text-[11px] text-gray-400 mt-0.5 italic">Skala Maksimum 5.00</div>
            </div>
          </div>
        </div>

        {/* SECTION 1: AI EXECUTIVE REPORT (BENTO STYLE) */}
        <div className="space-y-5">
          <div className="flex items-center justify-between no-print">
            <h3 className="text-lg font-bold text-[#1d1d1f] flex items-center gap-2 tracking-tight">
              <Sparkles size={18} className="text-indigo-500" />
              Ringkasan Eksekutif & Analisis AI
            </h3>
            {project.aiSummary && (
              <div className="flex items-center gap-2">
                <button
                  id="btn-regenerate-ai"
                  onClick={compileAISummary}
                  disabled={loadingSummary}
                  className="p-1.5 rounded-xl hover:bg-[#f5f5f7] border border-[#e8e8ed] text-[#86868b] hover:text-[#1d1d1f] transition-all flex items-center gap-1.5 text-xs font-semibold"
                >
                  <RefreshCw size={13} className={loadingSummary ? "animate-spin" : ""} />
                  Regenerasi
                </button>
                <button
                  id="btn-copy-ai"
                  onClick={handleCopyText}
                  className="p-1.5 rounded-xl hover:bg-[#f5f5f7] border border-[#e8e8ed] text-[#86868b] hover:text-[#1d1d1f] transition-all flex items-center gap-1.5 text-xs font-semibold"
                >
                  {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                  Salin Teks
                </button>
              </div>
            )}
          </div>

          {!project.aiSummary ? (
            <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-2xl border border-indigo-100 p-8 text-center no-print">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="text-base font-bold text-indigo-950">Susun Ringkasan Eksekutif Instansi</h3>
              <p className="text-xs text-indigo-800/80 max-w-lg mx-auto mt-1 leading-relaxed">
                Asisten AI akan menganalisis data scoring dari ke-10 indikator di atas, merumuskan peta kekuatan instansi, menguraikan celah keamanan/kepatuhan kritis, dan menyusun Roadmap Rencana Aksi Prioritas untuk Bupati/Walikota.
              </p>
              <button
                id="btn-generate-executive"
                onClick={compileAISummary}
                disabled={loadingSummary}
                className="mt-4 px-5 py-2.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#4f46e5] hover:to-[#9333ea] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                {loadingSummary ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                {loadingSummary ? "Sedang Menganalisis Seluruh Data..." : "Rumuskan Laporan Eksekutif SPBE Sekarang"}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Executive text card */}
              <div className="bg-[#f5f5f7] rounded-2xl p-5 border border-[#e8e8ed] leading-relaxed text-[#1d1d1f] text-sm">
                <p className="font-semibold text-xs text-[#86868b] uppercase tracking-widest mb-2.5 flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-[#0066cc]" /> Pengantar Ringkasan Eksekutif
                </p>
                {project.aiSummary.executiveSummary}
              </div>

              {/* Strengths & Weaknesses grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="border border-green-100 bg-[#e2f9e9]/20 rounded-2xl p-5">
                  <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <CheckCircle2 size={15} className="text-green-500" /> Kekuatan Utama Kepatuhan
                  </h4>
                  <ul className="space-y-2 text-xs text-green-950/80 list-disc list-inside leading-relaxed">
                    {project.aiSummary.keyStrengths.map((s, idx) => (
                      <li key={idx} className="marker:text-green-500 pl-1">{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="border border-red-100 bg-[#fbe8ea]/20 rounded-2xl p-5">
                  <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <Flame size={15} className="text-red-500" /> Celah Hambatan Kritis
                  </h4>
                  <ul className="space-y-2 text-xs text-red-950/80 list-disc list-inside leading-relaxed">
                    {project.aiSummary.keyWeaknesses.map((w, idx) => (
                      <li key={idx} className="marker:text-red-500 pl-1">{w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Priority Roadmap Action Plan */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#86868b] uppercase tracking-wider flex items-center gap-1.5">
                  Roadmap & Rencana Aksi Prioritas (Saran Taktis)
                </h4>
                <div className="border border-[#e8e8ed] rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#f5f5f7] border-b border-[#e8e8ed] text-[10px] font-bold text-[#86868b] uppercase">
                        <th className="py-2.5 px-4 w-44">Tindakan Perbaikan</th>
                        <th className="py-2.5 px-4 text-center w-28">Urgensi</th>
                        <th className="py-2.5 px-4">Uraian Langkah Perbaikan Kominfo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f5f5f7]">
                      {project.aiSummary.priorityActionPlan.map((action, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/40">
                          <td className="py-3 px-4 font-bold text-[#1d1d1f]">{action.action}</td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                action.priority === "Tinggi"
                                  ? "bg-[#fbe8ea] text-[#ff3b30]"
                                  : action.priority === "Sedang"
                                  ? "bg-[#fff2e0] text-[#ff9500]"
                                  : "bg-[#e1f0ff] text-[#0066cc]"
                              }`}
                            >
                              {action.priority}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 leading-relaxed">{action.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: OFFICIAL WORKING PAPER TABLE */}
        <div className="space-y-4 pt-4 border-t border-[#f5f5f7]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-base font-bold text-[#1d1d1f] tracking-tight">
              Matriks Kertas Kerja Audit Sistematis (Working Paper)
            </h3>
            <span className="text-[11px] text-[#86868b] font-medium">
              Sesuai Snapshot Formulir Observasi SPBE
            </span>
          </div>

          <div className="border border-[#e8e8ed] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f5f5f7] border-b border-[#e8e8ed] text-[10px] font-bold text-[#86868b] uppercase tracking-wider">
                    <th className="py-3 px-3 text-center w-12">No</th>
                    <th className="py-3 px-3 w-56">Indikator Audit</th>
                    <th className="py-3 px-3 w-44">Kondisi Aktual</th>
                    <th className="py-3 px-3 w-32">Evidence / Bukti</th>
                    <th className="py-3 px-3 text-center w-16">Skor</th>
                    <th className="py-3 px-3 text-center w-16">Temuan</th>
                    <th className="py-3 px-3 w-48">Rekomendasi Perbaikan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f5f7]">
                  {project.answers.map((ans, idx) => (
                    <tr key={ans.id} className="hover:bg-gray-50/50 transition-colors leading-relaxed">
                      {/* No */}
                      <td className="py-3 px-3 font-semibold text-[#86868b] text-center">{idx + 1}</td>
                      
                      {/* Indikator */}
                      <td className="py-3 px-3 font-medium text-[#1d1d1f]">{ans.indicator}</td>
                      
                      {/* Kondisi Aktual */}
                      <td className="py-3 px-3 text-gray-600">{ans.actualCondition || "-"}</td>
                      
                      {/* Evidence */}
                      <td className="py-3 px-3 text-gray-500 font-mono text-[10px]">{ans.evidence || "-"}</td>
                      
                      {/* Skor */}
                      <td className="py-3 px-3 text-center">
                        <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-xs ${
                          ans.score <= 2 
                            ? "bg-[#fbe8ea] text-[#ff3b30]" 
                            : ans.score <= 4 
                            ? "bg-[#fff2e0] text-[#ff9500]" 
                            : "bg-[#e2f9e9] text-[#1ab346]"
                        }`}>
                          {ans.score}
                        </span>
                      </td>
                      
                      {/* Temuan */}
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ans.finding === "Ada" 
                            ? "bg-[#fbe8ea] text-[#ff3b30]" 
                            : "bg-[#e2f9e9] text-[#1ab346]"
                        }`}>
                          {ans.finding}
                        </span>
                        {ans.temuan && (
                          <p className="text-[9px] text-gray-500 mt-1 text-left line-clamp-2 italic" title={ans.temuan}>
                            "{ans.temuan}"
                          </p>
                        )}
                      </td>
                      
                      {/* Rekomendasi */}
                      <td className="py-3 px-3 text-gray-600 italic">
                        {ans.rekomendasi || (ans.score === 5 ? "Aspek terpenuhi secara optimal." : "-")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Official Report Footer (Visible during print) */}
        <div className="hidden print:flex justify-between items-center pt-10 border-t border-dashed border-gray-300 text-xs text-gray-400">
          <div>Laporan Evaluasi SPBE Digital - Kabupaten/Kota Selaras</div>
          <div>Paraf Auditor: __________________</div>
        </div>

      </div>
    </div>
  );
}
