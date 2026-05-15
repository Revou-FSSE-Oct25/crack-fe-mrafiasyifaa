import Link from "next/link";
import { WhySection } from "@/components/landing/why-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";

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

      <WhySection />
      <HowItWorksSection />

      {/* Footer — putih */}
      <footer className="bg-ams-white text-center py-10 text-xs text-ams-black/30">
        © 2026 AMS — Antibiotic Management System
      </footer>
    </div>
  );
}
