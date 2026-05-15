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

export function HowItWorksSection() {
  return (
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
  );
}
