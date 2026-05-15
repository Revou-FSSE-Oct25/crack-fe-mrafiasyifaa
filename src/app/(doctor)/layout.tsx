import { Navbar } from "@/components/navbar";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ams-gray">
      <Navbar />
      <main className="max-w-6xl mx-auto px-8 py-8">{children}</main>
    </div>
  );
}
