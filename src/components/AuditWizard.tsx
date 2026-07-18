import React, { useState, useRef } from "react";
import { 
  ArrowLeft, ArrowRight, Save, LayoutGrid, CheckCircle2, 
  Sparkles, Upload, FileText, Check, AlertCircle, RefreshCw, Layers
} from "lucide-react";
import { AuditProject, AuditAnswer } from "../types";

interface AuditWizardProps {
  project: AuditProject;
  onSaveProgress: (updatedAnswers: AuditAnswer[], isCompleted?: boolean) => void;
  onBackToDashboard: () => void;
}

export default function AuditWizard({
  project,
  onSaveProgress,
  onBackToDashboard,
}: AuditWizardProps) {
  const [answers, setAnswers] = useState<AuditAnswer[]>(() => {
    // Clone project answers so edits are kept local until saved
    return JSON.parse(JSON.stringify(project.answers));
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [viewMode, setViewMode] = useState<"wizard" | "table">("wizard");
  const [loadingAI, setLoadingAI] = useState<string | null>(null); // holds answer ID currently loading
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentAnswer = answers[currentStep];

  const handleFieldChange = (id: string, field: keyof AuditAnswer, value: any) => {
    setAnswers((prev) =>
      prev.map((ans) => (ans.id === id ? { ...ans, [field]: value } : ans))
    );
  };

  // Automated Finding Detection: if score is less than 5, default finding to "Ada"
  const handleScoreChange = (id: string, score: number) => {
    setAnswers((prev) =>
      prev.map((ans) => {
        if (ans.id === id) {
          const finding = score < 5 ? "Ada" : "Tidak";
          return { ...ans, score, finding };
        }
        return ans;
      })
    );
  };

  // Sparkle AI feature to write Findings (Temuan) and Recommendations (Rekomendasi)
  const generateAIRecommendation = async (id: string) => {
    const targetAns = answers.find((ans) => ans.id === id);
    if (!targetAns) return;

    setLoadingAI(id);

    try {
      const res = await fetch("/api/audit/analyze-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          indicator: targetAns.indicator,
          score: targetAns.score,
          actualCondition: targetAns.actualCondition,
          evidence: targetAns.evidence,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal memanggil API asisten AI.");
      }

      const data = await res.json();
      if (data.temuan || data.rekomendasi) {
        setAnswers((prev) =>
          prev.map((ans) =>
            ans.id === id
              ? {
                  ...ans,
                  temuan: data.temuan || ans.temuan,
                  rekomendasi: data.rekomendasi || ans.rekomendasi,
                }
              : ans
          )
        );
      }
    } catch (error) {
      alert("Maaf, terjadi kesalahan saat menghubungi AI Asisten. Silakan coba kembali.");
      console.error(error);
    } finally {
      setLoadingAI(null);
    }
  };

  // Simulate screenshot upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const mockLink = `Screenshot_${file.name.replace(/\s+/g, "_")} (${(file.size / 1024).toFixed(0)} KB)`;
      handleFieldChange(currentAnswer.id, "evidence", mockLink);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const mockLink = `Screenshot_${file.name.replace(/\s+/g, "_")} (${(file.size / 1024).toFixed(0)} KB)`;
      handleFieldChange(currentAnswer.id, "evidence", mockLink);
    }
  };

  const handleSave = (isCompleted = false) => {
    onSaveProgress(answers, isCompleted);
  };

  const scoreDescriptions = [
    "Sangat Kurang (Belum ada penerapan sama sekali)",
    "Kurang (Penerapan awal / ad-hoc)",
    "Cukup (Sudah diterapkan sebagian kecil)",
    "Baik (Diterapkan merata di sebagian besar modul)",
    "Sangat Baik (Terpenuhi seluruhnya & terdokumentasi lengkap)"
  ];

  return (
    <div className="space-y-6">
      {/* Upper Navigation Row */}
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
            <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
              Working Paper SPBE
            </span>
            <h2 className="text-xl font-bold text-[#1d1d1f] tracking-tight truncate max-w-sm md:max-w-xl">
              {project.projectName}
            </h2>
          </div>
        </div>

        {/* View Toggle and Actions */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Segmented Control Mode */}
          <div className="bg-[#f5f5f7] p-0.5 rounded-xl flex items-center border border-[#e8e8ed]">
            <button
              id="view-mode-wizard"
              onClick={() => setViewMode("wizard")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === "wizard"
                  ? "bg-white text-[#1d1d1f] shadow-sm font-semibold"
                  : "text-[#86868b] hover:text-[#1d1d1f]"
              }`}
            >
              <Layers size={13} />
              Wizard Asisten
            </button>
            <button
              id="view-mode-table"
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === "table"
                  ? "bg-white text-[#1d1d1f] shadow-sm font-semibold"
                  : "text-[#86868b] hover:text-[#1d1d1f]"
              }`}
            >
              <FileText size={13} />
              Tabel Kerja
            </button>
          </div>

          <button
            id="save-draft-btn"
            onClick={() => handleSave(false)}
            className="px-4 py-2 text-xs font-medium bg-[#f5f5f7] text-[#1d1d1f] hover:bg-gray-200/50 active:bg-gray-200 rounded-xl transition-all border border-[#e8e8ed] flex items-center gap-1.5"
          >
            <Save size={14} />
            Simpan Draft
          </button>

          <button
            id="complete-audit-btn"
            onClick={() => handleSave(true)}
            className="px-4 py-2 text-xs font-semibold bg-[#1ab346] hover:bg-[#1ebd4e] text-white rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle2 size={14} />
            Selesaikan & Rangkum AI
          </button>
        </div>
      </div>

      {/* Progress bar in Wizard view */}
      {viewMode === "wizard" && (
        <div className="space-y-1.5 no-print">
          <div className="flex items-center justify-between text-xs text-[#86868b]">
            <span className="font-semibold text-[#1d1d1f]">Kemajuan Pengisian</span>
            <span>
              {answers.filter((a) => a.actualCondition.trim() !== "").length} dari {answers.length}{" "}
              Indikator Terisi
            </span>
          </div>
          <div className="h-2 bg-[#f5f5f7] rounded-full overflow-hidden border border-[#e8e8ed]">
            <div
              className="h-full bg-[#0066cc] rounded-full transition-all duration-300"
              style={{
                width: `${(answers.filter((a) => a.actualCondition.trim() !== "").length / answers.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      )}

      {/* VIEW 1: WIZARD MODE */}
      {viewMode === "wizard" && currentAnswer && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sidebar stepper */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#e8e8ed] p-4 space-y-1 shadow-sm max-h-[70vh] overflow-y-auto no-print">
            <h4 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider px-3 mb-3">
              Indikator Evaluasi
            </h4>
            {answers.map((ans, idx) => {
              const isDone = ans.actualCondition.trim() !== "";
              const isSelected = currentStep === idx;
              return (
                <button
                  key={ans.id}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 ${
                    isSelected
                      ? "bg-[#e1f0ff] text-[#0066cc] font-semibold"
                      : "hover:bg-[#f5f5f7] text-[#1d1d1f]"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isSelected
                        ? "bg-[#0066cc] text-white"
                        : isDone
                        ? "bg-[#e2f9e9] text-[#1ab346]"
                        : "bg-[#f5f5f7] text-[#86868b] border border-gray-200"
                    }`}
                  >
                    {isDone && !isSelected ? "✓" : idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs line-clamp-2 leading-relaxed">{ans.indicator}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-[#86868b]">Skor: {ans.score}/5</span>
                      {ans.finding === "Ada" && (
                        <span className="text-[9px] font-semibold text-[#ff3b30] bg-[#fbe8ea] px-1 rounded">
                          Ada Temuan
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Core Questionnaire Card */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-[#e8e8ed] shadow-sm p-6 space-y-6">
              {/* Question Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0066cc] bg-[#e1f0ff] px-2.5 py-0.5 rounded-full">
                    Indikator {currentStep + 1} dari {answers.length}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#1d1d1f] tracking-tight leading-snug">
                  {currentAnswer.indicator}
                </h3>
              </div>

              <div className="border-t border-[#f5f5f7] pt-5 space-y-5">
                {/* 1. Kondisi Aktual Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#86868b] uppercase tracking-wider flex items-center justify-between">
                    <span>1. Kondisi Aktual (Hasil Observasi) <span className="text-red-500">*</span></span>
                    <span className="text-[10px] font-normal lowercase italic text-gray-400">diisi saat observasi langsung</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Aplikasi sudah menampilkan daftar layanan lengkap, namun belum menyantumkan estimasi waktu pengerjaan secara transparan..."
                    value={currentAnswer.actualCondition}
                    onChange={(e) => handleFieldChange(currentAnswer.id, "actualCondition", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#e8e8ed] bg-[#f5f5f7] text-[#1d1d1f] placeholder-[#86868b]/70 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] focus:bg-white transition-all text-sm resize-none leading-relaxed"
                  />
                </div>

                {/* 2. Score selection - Custom Segmented Blocks */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
                    2. Skor Evaluasi SPBE (1 - 5)
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((scoreNum) => {
                      const isActive = currentAnswer.score === scoreNum;
                      let colorClass = "hover:bg-[#f5f5f7] text-[#1d1d1f] border-[#e8e8ed]";
                      if (isActive) {
                        if (scoreNum <= 2) colorClass = "bg-[#fbe8ea] border-[#ff3b30] text-[#ff3b30] font-bold";
                        else if (scoreNum <= 4) colorClass = "bg-[#fff2e0] border-[#ff9500] text-[#ff9500] font-bold";
                        else colorClass = "bg-[#e2f9e9] border-[#1ab346] text-[#1ab346] font-bold";
                      }
                      return (
                        <button
                          key={scoreNum}
                          id={`score-btn-${scoreNum}`}
                          type="button"
                          onClick={() => handleScoreChange(currentAnswer.id, scoreNum)}
                          className={`py-3 rounded-xl border text-center transition-all text-base ${colorClass}`}
                        >
                          {scoreNum}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-[#86868b] leading-relaxed italic bg-[#f5f5f7] p-2.5 rounded-xl border border-dashed border-[#e8e8ed] flex items-center gap-2">
                    <AlertCircle size={14} className="text-[#86868b] flex-shrink-0" />
                    <span>{scoreDescriptions[currentAnswer.score - 1]}</span>
                  </p>
                </div>

                {/* 3. Evidence Screenshot Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
                    3. Bukti Pendukung / Evidence
                  </label>
                  <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      dragActive
                        ? "border-[#0066cc] bg-[#e1f0ff]/30"
                        : "border-[#e8e8ed] bg-[#f5f5f7] hover:bg-gray-100/50"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="image/*"
                    />
                    <Upload size={22} className="text-[#86868b] mb-1.5" />
                    <span className="text-xs font-medium text-[#1d1d1f]">
                      Unggah Bukti Screenshot Observasi
                    </span>
                    <span className="text-[10px] text-[#86868b] mt-0.5">
                      Tarik & lepas file gambar di sini, atau klik untuk memilih file
                    </span>
                  </div>

                  {/* Evidence Text link/notes */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Atau tulis deskripsi dokumen rujukan bukti / nama file..."
                      value={currentAnswer.evidence}
                      onChange={(e) => handleFieldChange(currentAnswer.id, "evidence", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#e8e8ed] bg-[#f5f5f7] text-[#1d1d1f] placeholder-[#86868b]/70 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] focus:bg-white transition-all text-xs"
                    />
                  </div>
                </div>

                {/* 4. Temuan & AI recommendation section */}
                <div className="pt-3 border-t border-[#f5f5f7] space-y-4">
                  {/* Finding Segmented Control and Sparkle Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f5f5f7] p-3 rounded-2xl border border-[#e8e8ed]">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider">
                        Apakah Ada Temuan Masalah?
                      </span>
                      {/* Segmented Option */}
                      <div className="bg-white p-0.5 rounded-lg flex items-center border border-gray-200">
                        <button
                          type="button"
                          onClick={() => handleFieldChange(currentAnswer.id, "finding", "Ada")}
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                            currentAnswer.finding === "Ada"
                              ? "bg-[#ff3b30] text-white shadow-sm"
                              : "text-[#86868b] hover:text-[#1d1d1f]"
                          }`}
                        >
                          Ada
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFieldChange(currentAnswer.id, "finding", "Tidak")}
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                            currentAnswer.finding === "Tidak"
                              ? "bg-[#1ab346] text-white shadow-sm"
                              : "text-[#86868b] hover:text-[#1d1d1f]"
                          }`}
                        >
                          Tidak
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      id={`ai-analyze-btn-${currentAnswer.id}`}
                      disabled={loadingAI === currentAnswer.id}
                      onClick={() => generateAIRecommendation(currentAnswer.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#4f46e5] hover:to-[#9333ea] text-white shadow-sm active:scale-95 transition-all disabled:opacity-50"
                    >
                      {loadingAI === currentAnswer.id ? (
                        <RefreshCw size={13} className="animate-spin" />
                      ) : (
                        <Sparkles size={13} />
                      )}
                      {loadingAI === currentAnswer.id ? "Sedang Menganalisis..." : "Tulis dengan AI Asisten"}
                    </button>
                  </div>

                  {/* Textarea fields for Temuan & Rekomendasi */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#86868b] uppercase tracking-wider flex items-center justify-between">
                        <span>Detail Temuan Masalah</span>
                        {currentAnswer.finding === "Tidak" && (
                          <span className="text-[10px] text-gray-400 font-normal italic">Opsional (Skor 5)</span>
                        )}
                      </label>
                      <textarea
                        rows={3}
                        placeholder={
                          currentAnswer.finding === "Ada"
                            ? "Deskripsikan secara detail kegagalan sistem atau ketidaksesuaian..."
                            : "Uraikan aspek unggul yang ditemukan..."
                        }
                        value={currentAnswer.temuan}
                        onChange={(e) => handleFieldChange(currentAnswer.id, "temuan", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[#e8e8ed] bg-white text-[#1d1d1f] placeholder-[#86868b]/70 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] transition-all text-xs resize-none leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#86868b] uppercase tracking-wider flex items-center justify-between">
                        <span>Rekomendasi Rencana Aksi</span>
                        {currentAnswer.finding === "Tidak" && (
                          <span className="text-[10px] text-gray-400 font-normal italic">Opsional (Skor 5)</span>
                        )}
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Uraikan perbaikan teknologi, perubahan SOP, atau kebijakan pembenahan segera..."
                        value={currentAnswer.rekomendasi}
                        onChange={(e) => handleFieldChange(currentAnswer.id, "rekomendasi", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[#e8e8ed] bg-white text-[#1d1d1f] placeholder-[#86868b]/70 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] transition-all text-xs resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center justify-between no-print">
              <button
                id="prev-indicator-btn"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-4 py-2.5 text-xs font-semibold bg-white border border-[#e8e8ed] rounded-xl text-[#1d1d1f] hover:bg-[#f5f5f7] active:bg-gray-100 disabled:opacity-40 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <ArrowLeft size={14} /> Indikator Sebelumnya
              </button>

              <button
                id="next-indicator-btn"
                disabled={currentStep === answers.length - 1}
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-4 py-2.5 text-xs font-semibold bg-white border border-[#e8e8ed] rounded-xl text-[#1d1d1f] hover:bg-[#f5f5f7] active:bg-gray-100 disabled:opacity-40 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                Indikator Selanjutnya <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: FULL WORKING PAPER TABLE (SPREADSHEET LAYOUT) */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl border border-[#e8e8ed] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#f5f5f7] border-b border-[#e8e8ed] text-[10px] font-bold text-[#86868b] uppercase tracking-wider">
                  <th className="py-3.5 px-4 text-center w-12">No</th>
                  <th className="py-3.5 px-4 w-64">Indikator Audit</th>
                  <th className="py-3.5 px-4 w-48">Kondisi Aktual</th>
                  <th className="py-3.5 px-4 w-40">Evidence / Bukti</th>
                  <th className="py-3.5 px-4 text-center w-28">Skor (1-5)</th>
                  <th className="py-3.5 px-4 text-center w-24">Temuan</th>
                  <th className="py-3.5 px-4 w-48">Rekomendasi Rencana Aksi</th>
                  <th className="py-3.5 px-4 text-center w-16 no-print">AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f7]">
                {answers.map((ans, idx) => (
                  <tr key={ans.id} className="hover:bg-gray-50/50 transition-colors text-xs">
                    {/* Index */}
                    <td className="py-4 px-4 font-semibold text-[#86868b] text-center">{idx + 1}</td>

                    {/* Indicator */}
                    <td className="py-4 px-4 font-medium text-[#1d1d1f] leading-relaxed">
                      {ans.indicator}
                    </td>

                    {/* Actual Condition */}
                    <td className="py-4 px-4">
                      <textarea
                        value={ans.actualCondition}
                        onChange={(e) => handleFieldChange(ans.id, "actualCondition", e.target.value)}
                        placeholder="Uraikan hasil observasi..."
                        className="w-full px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                        rows={3}
                      />
                    </td>

                    {/* Evidence */}
                    <td className="py-4 px-4">
                      <input
                        type="text"
                        value={ans.evidence}
                        onChange={(e) => handleFieldChange(ans.id, "evidence", e.target.value)}
                        placeholder="Bukti screenshot / link..."
                        className="w-full px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                      />
                    </td>

                    {/* Score */}
                    <td className="py-4 px-4 text-center">
                      <select
                        value={ans.score}
                        onChange={(e) => handleScoreChange(ans.id, parseInt(e.target.value))}
                        className="px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-semibold focus:bg-white focus:outline-none"
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>
                            Skor {num}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Finding */}
                    <td className="py-4 px-4 text-center">
                      <select
                        value={ans.finding}
                        onChange={(e) => handleFieldChange(ans.id, "finding", e.target.value as "Ada" | "Tidak")}
                        className={`px-2 py-1.5 rounded-lg border text-xs font-semibold focus:outline-none ${
                          ans.finding === "Ada"
                            ? "bg-[#fbe8ea] border-[#ff3b30] text-[#ff3b30]"
                            : "bg-[#e2f9e9] border-[#1ab346] text-[#1ab346]"
                        }`}
                      >
                        <option value="Ada">Ada</option>
                        <option value="Tidak">Tidak</option>
                      </select>
                    </td>

                    {/* Recommendations & Temuan combined in textareas */}
                    <td className="py-4 px-4 space-y-2">
                      <textarea
                        value={ans.temuan}
                        onChange={(e) => handleFieldChange(ans.id, "temuan", e.target.value)}
                        placeholder="Detail Temuan..."
                        className="w-full px-2 py-1 rounded-lg border border-gray-200 bg-gray-50 text-[10px] focus:bg-white focus:outline-none"
                        rows={2}
                      />
                      <textarea
                        value={ans.rekomendasi}
                        onChange={(e) => handleFieldChange(ans.id, "rekomendasi", e.target.value)}
                        placeholder="Detail Rekomendasi..."
                        className="w-full px-2 py-1 rounded-lg border border-gray-200 bg-gray-50 text-[10px] focus:bg-white focus:outline-none"
                        rows={2}
                      />
                    </td>

                    {/* AI trigger */}
                    <td className="py-4 px-4 text-center no-print">
                      <button
                        type="button"
                        onClick={() => generateAIRecommendation(ans.id)}
                        disabled={loadingAI === ans.id}
                        className="p-2 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                        title="Tulis temuan dan rekomendasi menggunakan asisten AI"
                      >
                        {loadingAI === ans.id ? (
                          <RefreshCw size={12} className="animate-spin" />
                        ) : (
                          <Sparkles size={12} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
