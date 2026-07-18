import React, { useState } from "react";
import { Plus, Search, Calendar, Globe, User, ChevronRight, Trash2, Award } from "lucide-react";
import { AuditProject } from "../types";

interface ProjectListProps {
  projects: AuditProject[];
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onOpenNewModal: () => void;
}

export default function ProjectList({
  projects,
  onSelectProject,
  onDeleteProject,
  onOpenNewModal,
}: ProjectListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProjects = projects.filter((proj) =>
    proj.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proj.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to calculate average score
  const getAverageScore = (project: AuditProject) => {
    const total = project.answers.reduce((acc, curr) => acc + curr.score, 0);
    return (total / project.answers.length).toFixed(2);
  };

  // Helper to get color for SPBE index
  const getIndexColor = (scoreStr: string) => {
    const score = parseFloat(scoreStr);
    if (score >= 4.2) return { bg: "bg-[#e2f9e9]", text: "text-[#1ab346]", label: "Sangat Baik" };
    if (score >= 3.5) return { bg: "bg-[#e1f0ff]", text: "text-[#0066cc]", label: "Baik" };
    if (score >= 2.6) return { bg: "bg-[#fff2e0]", text: "text-[#ff9500]", label: "Cukup" };
    if (score >= 1.8) return { bg: "bg-[#fbe8ea]", text: "text-[#ff3b30]", label: "Kurang" };
    return { bg: "bg-gray-100", text: "text-gray-500", label: "Sangat Kurang" };
  };

  return (
    <div className="space-y-6">
      {/* Upper Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Evaluasi Kematangan SPBE</h1>
          <p className="text-[#86868b] mt-1 text-sm">
            Mencatat dan mengaudit kesiapan Sistem Pemerintahan Berbasis Elektronik secara sistematis.
          </p>
        </div>
        <button
          id="btn-add-project"
          onClick={onOpenNewModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white active:bg-[#0055b3] transition-all font-medium text-sm self-start sm:self-auto shadow-sm"
        >
          <Plus size={18} />
          Mulai Audit Baru
        </button>
      </div>

      {/* Grid Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e8e8ed] shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-[#f5f5f7] rounded-xl text-[#0066cc]">
            <Award size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Total Evaluasi</div>
            <div className="text-2xl font-bold text-[#1d1d1f] mt-0.5">{projects.length} Aplikasi</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e8e8ed] shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-[#e2f9e9] rounded-xl text-[#1ab346]">
            <Award size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Indeks Rata-Rata</div>
            <div className="text-2xl font-bold text-[#1d1d1f] mt-0.5">
              {projects.length > 0
                ? (
                    projects.reduce((acc, curr) => acc + parseFloat(getAverageScore(curr)), 0) /
                    projects.length
                  ).toFixed(2)
                : "0.00"}{" "}
              <span className="text-xs text-[#86868b] font-normal">/ 5.0</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e8e8ed] shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-[#fff2e0] rounded-xl text-[#ff9500]">
            <Award size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Temuan Open</div>
            <div className="text-2xl font-bold text-[#1d1d1f] mt-0.5">
              {projects.reduce(
                (acc, curr) =>
                  acc + curr.answers.filter((ans) => ans.finding === "Ada").length,
                0
              )}{" "}
              Kasus
            </div>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#86868b]">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Cari berdasarkan nama dinas, portal, atau alamat domain..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-[#e8e8ed] rounded-2xl text-[#1d1d1f] placeholder-[#86868b]/70 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] transition-all shadow-sm text-sm"
        />
      </div>

      {/* Project Card List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e8e8ed] p-12 text-center shadow-sm">
            <div className="text-3xl mb-3">🔎</div>
            <h3 className="text-lg font-semibold text-[#1d1d1f]">Tidak ada proyek audit ditemukan</h3>
            <p className="text-[#86868b] text-sm max-w-sm mx-auto mt-1">
              {searchTerm ? "Coba ganti kata kunci pencarian Anda" : "Mulai dengan membuat audit aplikasi baru di tombol kanan atas."}
            </p>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const avgScore = getAverageScore(project);
            const style = getIndexColor(avgScore);
            const openFindings = project.answers.filter((ans) => ans.finding === "Ada").length;

            return (
              <div
                key={project.id}
                id={`project-card-${project.id}`}
                className="group relative bg-white border border-[#e8e8ed] rounded-2xl hover:border-gray-300 hover:shadow-md transition-all p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                onClick={() => onSelectProject(project.id)}
              >
                {/* Info Column */}
                <div className="space-y-2.5 flex-1 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#f5f5f7] text-[#1d1d1f]">
                      {project.status}
                    </span>
                    {project.url && (
                      <span className="text-xs text-[#86868b] flex items-center gap-1">
                        <Globe size={12} />
                        {project.url}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-[#1d1d1f] group-hover:text-[#0066cc] transition-colors">
                      {project.projectName}
                    </h3>
                    <p className="text-[#86868b] text-xs mt-0.5 line-clamp-2 leading-relaxed">
                      {project.description || "Tidak ada deskripsi portal."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#86868b]">
                    <span className="flex items-center gap-1">
                      <User size={13} />
                      {project.auditorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      {project.auditDate}
                    </span>
                    <span className="font-medium text-[#ff3b30] bg-[#fdf2f2] px-2 py-0.5 rounded-md">
                      {openFindings} Temuan Perbaikan
                    </span>
                  </div>
                </div>

                {/* Score & Action Column */}
                <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-[#f5f5f7]">
                  {/* Circle Score Card */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider">
                        Indeks SPBE
                      </div>
                      <div className={`text-xs font-semibold px-2 py-0.5 rounded-md mt-0.5 inline-block ${style.bg} ${style.text}`}>
                        {style.label}
                      </div>
                    </div>
                    <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border ${style.bg} ${style.text} font-bold`}>
                      <span className="text-base leading-none">{avgScore}</span>
                      <span className="text-[9px] font-normal leading-none mt-1">/ 5.0</span>
                    </div>
                  </div>

                  {/* Navigation Icon & Delete button */}
                  <div className="flex items-center gap-2">
                    <button
                      id={`delete-project-${project.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Apakah Anda yakin ingin menghapus proyek audit: ${project.projectName}?`)) {
                          onDeleteProject(project.id);
                        }
                      }}
                      className="p-2.5 rounded-full text-gray-400 hover:text-[#ff3b30] hover:bg-[#fdf2f2] active:bg-[#fbe8ea] transition-all"
                      title="Hapus Proyek"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="p-1.5 rounded-full bg-[#f5f5f7] text-[#1d1d1f] group-hover:bg-[#0066cc] group-hover:text-white transition-colors">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </div>
            );
          }))}
      </div>
    </div>
  );
}
