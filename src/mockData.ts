import { AuditProject } from "./types";

export const INITIAL_AUDIT_PROJECTS: AuditProject[] = [
  {
    id: "proj-1",
    projectName: "Portal Terpadu Kabupaten Sejahtera",
    url: "https://sejahterakab.go.id",
    description: "Portal utama pelayanan publik terpadu Kabupaten Sejahtera untuk akses layanan kependudukan, perizinan, dan perpajakan daerah.",
    auditorName: "Tristianto Raflesia",
    auditDate: "2026-07-18",
    status: "Draft",
    answers: [
      {
        id: "ind-1",
        indicator: "Aplikasi memiliki nama, domain, dan tujuan yang jelas sesuai dengan layanan publik yang diberikan.",
        actualCondition: "Portal memiliki nama resmi 'Portal Sejahtera', domain terarah langsung, dan menampilkan peta situs layanan yang jelas di halaman depan.",
        evidence: "Screenshot homepage https://sejahterakab.go.id menampilkan logo dan branding kabupaten yang jelas.",
        score: 5,
        finding: "Tidak",
        temuan: "Nama portal, alamat domain, dan tujuan situs sudah selaras dan sangat jelas menginformasikan tujuannya sebagai portal pelayanan publik daerah.",
        rekomendasi: "Pertahankan konsistensi identitas visual dan struktur penamaan layanan pada sub-domain lainnya."
      },
      {
        id: "ind-2",
        indicator: "Aplikasi menggunakan domain resmi pemerintah daerah (.go.id) sebagai identitas resmi.",
        actualCondition: "Situs utama sudah menggunakan domain resmi .go.id. Namun, untuk beberapa layanan pengaduan masih diarahkan ke alamat hosting eksternal dinkes-sejahtera.com.",
        evidence: "Link rujukan tombol pengaduan mengarah ke dinkes-sejahtera.com.",
        score: 2,
        finding: "Ada",
        temuan: "Terdapat inkonsistensi penggunaan domain resmi. Beberapa sub-layanan kesehatan masih menggunakan domain .com komersial.",
        rekomendasi: "Segera lakukan migrasi seluruh sub-domain eksternal (.com) ke dalam subdomain resmi pemerintah daerah (misalnya: dinkes.sejahterakab.go.id) sesuai amanat Perpres No. 95 Tahun 2018."
      },
      {
        id: "ind-3",
        indicator: "Aplikasi menampilkan daftar layanan publik elektronik yang disediakan secara transparan.",
        actualCondition: "Terdapat menu 'Daftar Layanan' di navigasi utama, memuat 15 layanan administratif daerah.",
        evidence: "Screenshot modul navigasi 'Layanan Publik' di menu utama.",
        score: 4,
        finding: "Tidak",
        temuan: "Daftar layanan sudah dipublikasikan secara transparan beserta persyaratan dokumennya.",
        rekomendasi: "Lengkapi dengan informasi estimasi waktu penyelesaian pelayanan dan tarif biaya (jika ada) untuk masing-masing jenis layanan."
      },
      {
        id: "ind-4",
        indicator: "Layanan dikelompokkan dengan jelas berdasarkan kategori atau kebutuhan pengguna (user-centric).",
        actualCondition: "Layanan sudah dibagi menjadi dua kelompok besar: 'Layanan Warga' dan 'Layanan Bisnis'. Pengelompokan ini memudahkan segmentasi pengguna.",
        evidence: "Visualisasi menu utama yang terbagi menjadi tab Warga dan Bisnis.",
        score: 5,
        finding: "Tidak",
        temuan: "Sistem pengelompokan layanan sangat ramah pengguna (user-centric) sesuai standar pelayanan publik modern.",
        rekomendasi: "Pertahankan dan terus lakukan evaluasi kepuasan pengguna secara berkala melalui survei kepuasan elektronik (e-SKM)."
      },
      {
        id: "ind-5",
        indicator: "Tersedia fitur pencarian layanan untuk memudahkan pengguna menemukan informasi secara cepat.",
        actualCondition: "Terdapat kolom pencarian di bagian atas halaman (header). Namun, fungsionalitas pencarian kurang optimal karena sering tidak menampilkan hasil untuk kata kunci yang relevan.",
        evidence: "Uji coba pencarian dengan kata kunci 'KTP' menghasilkan 'Data Tidak Ditemukan' meskipun layanan KTP tersedia.",
        score: 3,
        finding: "Ada",
        temuan: "Fitur pencarian tersedia secara visual tetapi mesin pencarinya (search engine) tidak terindeks dengan baik sehingga tidak fungsional.",
        rekomendasi: "Lakukan perbaikan sistem pengindeksan data layanan pada database portal agar mesin pencarian mampu mencocokkan kata kunci sinonim secara akurat."
      },
      {
        id: "ind-6",
        indicator: "Menu dan navigasi aplikasi mudah dipahami oleh masyarakat umum (user-friendly dan intuitif).",
        actualCondition: "Struktur navigasi simpel, menggunakan dropdown menu standar. Ukuran teks cukup terbaca namun kontras teks menu berwarna abu-abu tipis di atas latar putih kurang memenuhi standar keterbacaan.",
        evidence: "Uji coba aksesibilitas mandiri menunjukkan rasio kontras teks menu utama hanya 2.5:1.",
        score: 3,
        finding: "Ada",
        temuan: "Navigasi struktural sudah baik namun memiliki masalah kegunaan (usability) terkait rendahnya kontras warna teks menu yang menyulitkan pengguna lansia.",
        rekomendasi: "Ubah warna font menu utama menjadi abu-abu gelap (#333333 atau #1d1d1f) untuk meningkatkan kontras visual dan keterbacaan."
      },
      {
        id: "ind-7",
        indicator: "Aplikasi menyediakan informasi kontak helpdesk, aduan publik, atau saluran komunikasi layanan.",
        actualCondition: "Halaman footer memuat nomor telepon kantor Dinas Kominfo, email pengaduan, dan link WhatsApp helpdesk aktif.",
        evidence: "Screenshot footer portal utama Kabupaten Sejahtera.",
        score: 5,
        finding: "Tidak",
        temuan: "Saluran komunikasi dan aduan helpdesk sudah sangat lengkap, responsif, dan mudah ditemukan.",
        rekomendasi: "Pertahankan SLA penanganan aduan melalui WhatsApp agar masyarakat mendapatkan kepastian respon yang cepat."
      },
      {
        id: "ind-8",
        indicator: "Tersedia dokumen Kebijakan Privasi (Privacy Policy) untuk menjamin perlindungan data pribadi pengguna.",
        actualCondition: "Belum tersedia halaman atau tautan khusus yang membahas Kebijakan Privasi data masyarakat pada portal, padahal portal mengumpulkan data NIK untuk login layanan warga.",
        evidence: "Pengecekan seluruh menu footer dan sitemap tidak menemukan dokumen kebijakan privasi.",
        score: 1,
        finding: "Ada",
        temuan: "Belum tersedianya dokumen Kebijakan Privasi (Privacy Policy) yang merupakan pelanggaran prinsip dasar keamanan informasi dan pelindungan data pribadi (UU PDP).",
        rekomendasi: "Segera susun dokumen Kebijakan Privasi resmi yang menjelaskan bagaimana data pribadi pengguna (seperti NIK, nama, alamat) dikumpulkan, disimpan, dan dilindungi. Tampilkan tautan dokumen ini secara jelas di bagian footer portal."
      },
      {
        id: "ind-9",
        indicator: "Aplikasi dapat diakses dengan stabil (uptime tinggi) dan memiliki kecepatan muat halaman yang wajar.",
        actualCondition: "Portal terkadang mengalami kendala koneksi (lambat memuat gambar pahlawan/banner di landing page). Hasil uji kecepatan PageSpeed menunjukkan waktu muat halaman awal sekitar 5.8 detik.",
        evidence: "Hasil uji PageSpeed Insights: Kecepatan Mobile 32/100, Desktop 65/100.",
        score: 2,
        finding: "Ada",
        temuan: "Kinerja aplikasi kurang optimal, waktu pemuatan halaman melebihi ambang batas wajar (idealnya < 3 detik) disebabkan oleh ukuran file gambar spanduk banner yang terlalu besar tanpa kompresi.",
        rekomendasi: "Lakukan kompresi dan optimasi seluruh aset gambar/banner ke dalam format modern (seperti .webp atau .avif) dan terapkan teknik lazy loading pada konten visual."
      },
      {
        id: "ind-10",
        indicator: "Aplikasi mendukung prinsip aksesibilitas (kontras visual yang cukup dan ramah penyandang disabilitas).",
        actualCondition: "Belum ada fitur penyesuaian ukuran font, mode kontras tinggi (high contrast mode), atau dukungan pembaca layar (screen reader tags) untuk penyandang disabilitas netra.",
        evidence: "Pemeriksaan kode sumber tidak menemukan tag aria-label dan tidak ada tombol penyesuai aksesibilitas.",
        score: 2,
        finding: "Ada",
        temuan: "Portal belum ramah disabilitas karena tidak mendukung prinsip aksesibilitas dasar (accessibility guidelines).",
        rekomendasi: "Tambahkan widget aksesibilitas sederhana di pojok halaman untuk mengubah kontras warna, ukuran teks, dan pasang tag ARIA (Accessible Rich Internet Applications) pada struktur HTML utama."
      }
    ],
    aiSummary: {
      executiveSummary: "Portal Terpadu Kabupaten Sejahtera secara umum telah memulai langkah digitalisasi layanan publik yang struktural dengan baik (Indeks SPBE berkisar 3.20 - Predikat 'Cukup'). Portal ini memiliki keunggulan pada aspek penamaan, penyajian daftar layanan, pengelompokan yang berorientasi warga, serta kejelasan kontak helpdesk. Namun, kelemahan kritis terletak pada aspek kepatuhan legalitas seperti ketiadaan dokumen Kebijakan Privasi (skor 1), inkonsistensi penggunaan domain resmi (.go.id), ketidakakuratan mesin pencari internal, serta kinerja loading halaman dan aksesibilitas ramah disabilitas yang masih rendah. Diperlukan tindakan pembenahan terstruktur untuk meningkatkan indeks kematangan menuju predikat 'Baik' atau 'Sangat Baik'.",
      keyStrengths: [
        "Pengelompokan layanan yang sangat humanis (user-centric) membedakan kebutuhan warga dan pelaku bisnis secara taktis.",
        "Identitas nama portal dan saluran helpdesk aduan (WhatsApp, email) terintegrasi secara fungsional di halaman utama."
      ],
      keyWeaknesses: [
        "Tidak tersedianya dokumen Kebijakan Privasi (Privacy Policy) yang rentan terhadap pelanggaran regulasi Pelindungan Data Pribadi (UU PDP).",
        "Penggunaan domain non-pemerintah (.com) pada sub-layanan kesehatan daerah yang mengikis aspek kepercayaan publik.",
        "Kinerja muat halaman (loading speed) lambat dan belum mendukung prinsip aksesibilitas disabilitas."
      ],
      spbeIndexLevel: "Cukup",
      priorityActionPlan: [
        {
          action: "Penyusunan Kebijakan Privasi Resmi",
          priority: "Tinggi",
          description: "Menyusun dan mempublikasikan dokumen Pelindungan Data Pribadi (UU PDP) di footer situs guna melindungi data NIK pengguna."
        },
        {
          action: "Migrasi Sub-Domain Layanan Kesehatan",
          priority: "Tinggi",
          description: "Memindahkan domain dinkes-sejahtera.com ke subdomain resmi dinkes.sejahterakab.go.id guna standarisasi ketahanan siber pemerintah."
        },
        {
          action: "Optimasi Kompresi Aset Gambar",
          priority: "Sedang",
          description: "Mengompresi banner di beranda situs dan mengaktifkan WebP untuk memangkas waktu pemuatan halaman dari 5.8 detik menjadi < 3 detik."
        },
        {
          action: "Implementasi Widget Aksesibilitas Disabilitas",
          priority: "Rendah",
          description: "Menambahkan modul penyesuai teks dan kontras warna (A11y widget) untuk memenuhi standar keterbukaan informasi publik."
        }
      ]
    }
  }
];
