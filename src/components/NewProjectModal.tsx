import React, { useState } from "react";
import { X, Globe, FileText, User, Calendar } from "lucide-react";
import { AuditProject, DEFAULT_INDICATORS } from "../types";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (project: Omit<AuditProject, "id" | "answers" | "status">) => void;
}

export default function NewProjectModal({ isOpen, onClose, onCreate }: NewProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [auditorName, setAuditorName] = useState("Tristianto Raflesia");
  const [auditDate, setAuditDate] = useState(new Date().toISOString().split("T")[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    onCreate({
      projectName,
      url,
      description,
      auditorName,
      auditDate,
    });

    // Reset Form
    setProjectName("");
    setUrl("");
    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-fade-in">
      <div 
        id="new-project-modal-container"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#e8e8ed] flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f5f5f7]">
          <h2 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">Mulai Audit SPBE Baru</h2>
          <button 
            id="close-modal-btn"
            onClick={onClose}
            className="p-1 rounded-full text-[#86868b] hover:bg-[#f5f5f7] hover:text-[#1d1d1f] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#86868b] uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={13} /> Nama Aplikasi / Portal <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Portal Layanan Warga Kelurahan"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#e8e8ed] bg-[#f5f5f7] text-[#1d1d1f] placeholder-[#86868b]/70 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] focus:bg-white transition-all text-sm"
            />
          </div>

          {/* URL / Domain */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#86868b] uppercase tracking-wider flex items-center gap-1.5">
              <Globe size={13} /> URL / Domain Website
            </label>
            <input
              type="url"
              placeholder="Contoh: https://layanan.pemerintah.go.id"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#e8e8ed] bg-[#f5f5f7] text-[#1d1d1f] placeholder-[#86868b]/70 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] focus:bg-white transition-all text-sm"
            />
          </div>

          {/* Auditor Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#86868b] uppercase tracking-wider flex items-center gap-1.5">
              <User size={13} /> Nama Auditor / Evaluator
            </label>
            <input
              type="text"
              placeholder="Nama Lengkap Auditor"
              value={auditorName}
              onChange={(e) => setAuditorName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#e8e8ed] bg-[#f5f5f7] text-[#1d1d1f] placeholder-[#86868b]/70 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] focus:bg-white transition-all text-sm"
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#86868b] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={13} /> Tanggal Evaluasi
            </label>
            <input
              type="date"
              required
              value={auditDate}
              onChange={(e) => setAuditDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#e8e8ed] bg-[#f5f5f7] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] focus:bg-white transition-all text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#86868b] uppercase tracking-wider flex items-center gap-1.5">
              Deskripsi Singkat Portal
            </label>
            <textarea
              placeholder="Jelaskan secara singkat fungsi utama portal atau lingkup dinas terkait..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#e8e8ed] bg-[#f5f5f7] text-[#1d1d1f] placeholder-[#86868b]/70 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] focus:bg-white transition-all text-sm resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#f5f5f7] border-t border-[#e8e8ed] flex items-center justify-end gap-3">
          <button
            id="cancel-project-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-[#1d1d1f] hover:bg-gray-200/50 active:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            id="submit-project-btn"
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-[#0066cc] hover:bg-[#0077ed] text-white active:bg-[#0055b3] transition-colors shadow-sm"
          >
            Mulai Audit
          </button>
        </div>
      </div>
    </div>
  );
}
