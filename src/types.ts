export interface AuditAnswer {
  id: string;
  indicator: string;
  actualCondition: string;
  evidence: string;
  score: number;
  finding: "Ada" | "Tidak";
  temuan: string;
  rekomendasi: string;
}

export interface PriorityAction {
  action: string;
  priority: "Tinggi" | "Sedang" | "Rendah";
  description: string;
}

export interface AISummary {
  executiveSummary: string;
  keyStrengths: string[];
  keyWeaknesses: string[];
  spbeIndexLevel: "Sangat Kurang" | "Kurang" | "Cukup" | "Baik" | "Sangat Baik" | string;
  priorityActionPlan: PriorityAction[];
}

export interface AuditProject {
  id: string;
  projectName: string;
  url: string;
  description: string;
  auditorName: string;
  auditDate: string;
  status: "Draft" | "Selesai";
  answers: AuditAnswer[];
  aiSummary?: AISummary;
}

export const DEFAULT_INDICATORS = [
  "Aplikasi memiliki nama, domain, dan tujuan yang jelas sesuai dengan layanan publik yang diberikan.",
  "Aplikasi menggunakan domain resmi pemerintah daerah (.go.id) sebagai identitas resmi.",
  "Aplikasi menampilkan daftar layanan publik elektronik yang disediakan secara transparan.",
  "Layanan dikelompokkan dengan jelas berdasarkan kategori atau kebutuhan pengguna (user-centric).",
  "Tersedia fitur pencarian layanan untuk memudahkan pengguna menemukan informasi secara cepat.",
  "Menu dan navigasi aplikasi mudah dipahami oleh masyarakat umum (user-friendly dan intuitif).",
  "Aplikasi menyediakan informasi kontak helpdesk, aduan publik, atau saluran komunikasi layanan.",
  "Tersedia dokumen Kebijakan Privasi (Privacy Policy) untuk menjamin perlindungan data pribadi pengguna.",
  "Aplikasi dapat diakses dengan stabil (uptime tinggi) dan memiliki kecepatan muat halaman yang wajar.",
  "Aplikasi mendukung prinsip aksesibilitas (kontras visual yang cukup dan ramah penyandang disabilitas)."
];
