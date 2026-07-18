import React, { useState, useEffect } from "react";
import { INITIAL_AUDIT_PROJECTS } from "./mockData";
import { AuditProject, AuditAnswer, AISummary, DEFAULT_INDICATORS } from "./types";
import ProjectList from "./components/ProjectList";
import AuditWizard from "./components/AuditWizard";
import ReportView from "./components/ReportView";
import NewProjectModal from "./components/NewProjectModal";
import { ShieldCheck, Laptop, LogOut, FileText, ChevronRight, Settings } from "lucide-react";

export default function App() {
  const [projects, setProjects] = useState<AuditProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"dashboard" | "edit" | "report">("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load projects from LocalStorage on initialization
  useEffect(() => {
    const saved = localStorage.getItem("spbe_audit_projects");
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing local spbe_audit_projects, reverting to mock data", e);
        setProjects(INITIAL_AUDIT_PROJECTS);
      }
    } else {
      // Pre-seed with mock project so it's not empty and boring
      setProjects(INITIAL_AUDIT_PROJECTS);
      localStorage.setItem("spbe_audit_projects", JSON.stringify(INITIAL_AUDIT_PROJECTS));
    }
  }, []);

  // Save projects to LocalStorage helper
  const saveProjectsToStorage = (updatedProjects: AuditProject[]) => {
    setProjects(updatedProjects);
    localStorage.setItem("spbe_audit_projects", JSON.stringify(updatedProjects));
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Handle creating a new audit project
  const handleCreateProject = (projectDetails: Omit<AuditProject, "id" | "answers" | "status">) => {
    // Construct default answers list using pre-defined indicators from captured image + standard SPBE indicators
    const newAnswers: AuditAnswer[] = DEFAULT_INDICATORS.map((indicator, idx) => ({
      id: `ind-${idx + 1}`,
      indicator,
      actualCondition: "",
      evidence: "",
      score: 3, // Default neutral score
      finding: "Ada", // Since score is less than 5, default to Ada Temuan
      temuan: "",
      rekomendasi: "",
    }));

    const newProject: AuditProject = {
      ...projectDetails,
      id: `proj-${Date.now()}`,
      status: "Draft",
      answers: newAnswers,
    };

    const updated = [newProject, ...projects];
    saveProjectsToStorage(updated);
    
    // Auto-select and move to editing view immediately
    setSelectedProjectId(newProject.id);
    setCurrentView("edit");
  };

  // Handle deleting an audit project
  const handleDeleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    saveProjectsToStorage(updated);
    if (selectedProjectId === id) {
      setSelectedProjectId(null);
      setCurrentView("dashboard");
    }
  };

  // Save progress from AuditWizard
  const handleSaveProgress = (updatedAnswers: AuditAnswer[], isCompleted = false) => {
    if (!selectedProjectId) return;

    const updated = projects.map((p) => {
      if (p.id === selectedProjectId) {
        return {
          ...p,
          answers: updatedAnswers,
          status: (isCompleted ? "Selesai" : "Draft") as "Draft" | "Selesai",
        };
      }
      return p;
    });

    saveProjectsToStorage(updated);

    if (isCompleted) {
      // If completed, transition directly to report view
      setCurrentView("report");
    } else {
      // Just keep user updated and stay on edit view or notify
      alert("Kemajuan draft berhasil disimpan ke komputer Anda.");
    }
  };

  // Save AI Summary updates
  const handleUpdateAISummary = (summary: AISummary) => {
    if (!selectedProjectId) return;

    const updated = projects.map((p) => {
      if (p.id === selectedProjectId) {
        return {
          ...p,
          aiSummary: summary,
        };
      }
      return p;
    });

    saveProjectsToStorage(updated);
  };

  // Handle switching views directly
  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    const proj = projects.find((p) => p.id === id);
    if (proj?.status === "Selesai") {
      setCurrentView("report");
    } else {
      setCurrentView("edit");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-[#1d1d1f] antialiased flex flex-col selection:bg-[#0066cc]/20 selection:text-[#0066cc]">
      
      {/* Sleek Apple-style top navigation bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#e8e8ed] no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            onClick={() => { setSelectedProjectId(null); setCurrentView("dashboard"); }} 
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-all"
          >
            <div className="w-9 h-9 bg-[#1d1d1f] rounded-xl flex items-center justify-center text-white shadow-sm">
              <ShieldCheck size={20} className="text-[#34c759]" />
            </div>
            <div>
              <div className="font-bold text-sm leading-none tracking-tight flex items-center gap-1">
                AUDIT SPBE <span className="text-[10px] font-semibold text-[#0066cc] bg-[#e1f0ff] px-1.5 py-0.2 rounded-md">V2.5</span>
              </div>
              <div className="text-[10px] text-[#86868b] font-medium mt-0.5">Sistem Pengawasan Layanan Publik Digital</div>
            </div>
          </div>

          {/* Quick Stats right header */}
          <div className="flex items-center gap-6 text-xs text-[#86868b]">
            <div className="hidden md:flex items-center gap-1">
              <Laptop size={14} className="text-gray-400" />
              <span>Sesi Auditor Lokal</span>
            </div>
            {selectedProject && (
              <div className="hidden sm:flex items-center gap-1.5 font-medium bg-[#f5f5f7] px-3 py-1.5 rounded-full border border-gray-100">
                <span className="w-1.5 h-1.5 bg-[#ff9500] rounded-full animate-pulse"></span>
                <span className="text-[#1d1d1f] truncate max-w-[150px]">{selectedProject.projectName}</span>
              </div>
            )}
            <div className="w-px h-5 bg-gray-200"></div>
            <span className="text-[#1d1d1f] font-semibold">Kominfo RI</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        
        {/* DASHBOARD VIEW */}
        {currentView === "dashboard" && (
          <ProjectList
            projects={projects}
            onSelectProject={handleSelectProject}
            onDeleteProject={handleDeleteProject}
            onOpenNewModal={() => setIsModalOpen(true)}
          />
        )}

        {/* EDIT WORKING PAPER (WIZARD/TABLE) VIEW */}
        {currentView === "edit" && selectedProject && (
          <AuditWizard
            project={selectedProject}
            onSaveProgress={handleSaveProgress}
            onBackToDashboard={() => {
              setSelectedProjectId(null);
              setCurrentView("dashboard");
            }}
          />
        )}

        {/* REPORT/PRINT VIEW */}
        {currentView === "report" && selectedProject && (
          <ReportView
            project={selectedProject}
            onBackToDashboard={() => {
              setSelectedProjectId(null);
              setCurrentView("dashboard");
            }}
            onBackToEdit={() => setCurrentView("edit")}
            onUpdateAISummary={handleUpdateAISummary}
          />
        )}
      </main>

      {/* MODAL WINDOWS */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
      />

      {/* Apple-style minimalist footer */}
      <footer className="bg-white border-t border-[#e8e8ed] py-8 text-center text-xs text-[#86868b] mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-gray-500">Evaluasi SPBE • Kementerian Pendayagunaan Aparatur Negara dan Reformasi Birokrasi</p>
          <p>© 2026 Pemerintah Republik Indonesia. Dirancang berdasarkan standar audit kepatuhan SPBE Nasional.</p>
        </div>
      </footer>
    </div>
  );
}
