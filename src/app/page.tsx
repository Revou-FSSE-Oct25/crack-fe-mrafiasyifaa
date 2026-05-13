import Link from "next/link";
import { ShieldCheck, ClipboardList, UserPlus, CheckCircle } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Daftar Akun",
    description: "Dokter dan admin mendaftar akun sesuai role masing-masing dalam sistem.",
  },
  {
    step: "02",
    icon: ClipboardList,
    title: "Tambah Pasien",
    description: "Dokter mendaftarkan pasien dan mencatat diagnosis awal serta kondisi klinis.",
  },
  {
    step: "03",
    icon: ShieldCheck,
    title: "Ajukan Permintaan Antibiotik",
    description: "Dokter mengajukan permintaan antibiotik lengkap dengan data klinis dan hasil lab.",
  },
  {
    step: "04",
    icon: CheckCircle,
    title: "Review & Persetujuan",
    description: "Admin PPRA meninjau, mengklaim, lalu menyetujui atau menolak permintaan.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">

      {/* Navbar — abu-abu */}
      <nav className="bg-ams-gray flex items-center justify-between px-10 py-5">
        <span className="text-xl font-bold tracking-tight text-ams-black">AMS</span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2 text-sm font-medium text-ams-black hover:opacity-70 transition-opacity"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 text-sm font-semibold bg-ams-red text-white rounded-full hover:opacity-90 transition-opacity"
          >
            Mulai Sekarang
          </Link>
        </div>
      </nav>

      {/* Hero — abu-abu */}
      <section className="bg-ams-gray flex flex-col items-center justify-center text-center px-6 py-32 gap-6">
        <span className="text-xs font-semibold tracking-widest text-ams-black/50 uppercase border border-ams-black/10 px-4 py-1.5 rounded-full bg-white">
          Antibiotic Management System
        </span>
        <h1 className="text-6xl font-extrabold tracking-tight text-ams-black max-w-3xl leading-tight">
          Kelola Antibiotik Lebih Aman dan Terstruktur
        </h1>
        <p className="text-lg text-ams-black/60 max-w-xl leading-relaxed">
          Platform manajemen permintaan antibiotik rumah sakit — menghubungkan dokter dan tim PPRA dalam satu alur kerja yang jelas.
        </p>
        <div className="flex items-center gap-3 mt-2">
          <Link
            href="/register"
            className="px-7 py-3 bg-ams-red text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            Mulai Sekarang
          </Link>
          <Link
            href="/login"
            className="px-7 py-3 bg-white text-ams-black font-semibold rounded-full border border-ams-black/10 hover:bg-ams-black/5 transition-colors"
          >
            Masuk
          </Link>
        </div>
      </section>

      {/* Why we built it — putih */}
      <section className="bg-ams-white px-10 py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-ams-black/40 uppercase mb-3">
            Why We Built It
          </p>
          <h2 className="text-3xl font-bold text-ams-black mb-8">
            Dibangun untuk pengendalian antibiotik yang lebih bertanggung jawab
          </h2>
          <div className="bg-ams-gray rounded-2xl p-8 text-ams-black/70 leading-relaxed space-y-4 text-base">
            <p>
              Penggunaan antibiotik yang tidak terkontrol menjadi salah satu penyebab utama resistensi antimikroba — ancaman kesehatan global yang nyata. Banyak rumah sakit di Indonesia masih memiliki proses permintaan dan persetujuan antibiotik secara manual dan melelahkan.
            </p>
            <p>
              Setelah melihat banyak alur kerja di berbagai rumah sakit Indonesia, nampak jelas proses dokumentasi dan birokrasi antibiotik bukanlah hal tersulit. Masalah utama terletak pada alur yang repetitif, melibatkan banyak dokumen dan mitra yang menyulitkan proses audit dan perekapan data.
            </p>
            <p>
              AMS hadir sebagai jembatan antara dokter dan tim Panitia Pengendali Resistensi Antimikroba (PPRA). Dokter dapat mengajukan permintaan antibiotik dilengkapi data klinis lengkap, sementara admin PPRA dapat meninjau, mengklaim, dan memberikan keputusan secara terorganisir.
            </p>
            <p>
              Dengan sistem ini, setiap permintaan antibiotik terdokumentasi dengan baik, proses review lebih transparan, dan riwayat kondisi pasien selalu terpantau — semua dalam satu platform.
            </p>
          </div>
        </div>
      </section>

      {/* How it works — abu-abu */}
      <section className="bg-ams-gray px-10 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-ams-black mb-2">Cara kerja AMS</h2>
          <p className="text-ams-black/50 mb-10 text-base">
            Empat langkah sederhana dari pendaftaran hingga persetujuan antibiotik.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {steps.map(({ step, icon: Icon, title, description }) => (
              <div key={step} className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-ams-red/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-ams-red" />
                  </div>
                  <span className="text-xs font-semibold text-ams-black/30 tracking-widest uppercase">
                    Step {step}
                  </span>
                </div>
                <h3 className="font-bold text-ams-black text-base">{title}</h3>
                <p className="text-sm text-ams-black/60 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer — putih */}
      <footer className="bg-ams-white text-center py-10 text-xs text-ams-black/30">
        © 2026 AMS — Antibiotic Management System
      </footer>
    </div>
  );
}
