import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ams-gray flex flex-col items-center justify-center gap-6 text-center px-6">
      <p className="text-8xl font-extrabold text-ams-black/10">404</p>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-ams-black">Halaman tidak ditemukan</h1>
        <p className="text-sm text-ams-black/50">Halaman yang kamu cari tidak ada atau sudah dipindahkan.</p>
      </div>
      <Link
        href="/"
        className="px-6 py-2.5 bg-ams-red text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
