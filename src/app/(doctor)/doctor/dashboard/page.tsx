"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ClipboardList, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { Patient, AntibioticRequest } from "@/types";
import { Badge } from "@/components/ui/badge";

const conditionConfig = {
  STABIL: { label: "Stabil", className: "bg-blue-50 text-blue-700 border-blue-200" },
  MEMBAIK: { label: "Membaik", className: "bg-green-50 text-green-700 border-green-200" },
  MEMBURUK: { label: "Memburuk", className: "bg-red-50 text-ams-red border-ams-red/20" },
  SELESAI: { label: "Selesai", className: "bg-ams-gray text-ams-black/50 border-ams-black/10" },
};

const statusConfig = {
  PENDING: { label: "Menunggu", className: "bg-ams-orange-light text-ams-orange border-ams-orange/20" },
  APPROVED: { label: "Disetujui", className: "bg-green-50 text-green-700 border-green-200" },
  REJECTED: { label: "Ditolak", className: "bg-red-50 text-ams-red border-ams-red/20" },
};

export default function DoctorDashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [requests, setRequests] = useState<AntibioticRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [p, r] = await Promise.all([
          api.get<Patient[]>("/patients"),
          api.get<AntibioticRequest[]>("/antibiotic-requests"),
        ]);
        setPatients(p ?? []);
        setRequests(r ?? []);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const pending = requests.filter((r) => r.status === "PENDING").length;
  const approved = requests.filter((r) => r.status === "APPROVED").length;

  const stats = [
    { label: "Total Pasien", value: patients.length, icon: Users, color: "bg-ams-blue/10 text-ams-blue" },
    { label: "Permintaan Aktif", value: pending, icon: Clock, color: "bg-ams-orange-light text-ams-orange" },
    { label: "Disetujui", value: approved, icon: CheckCircle, color: "bg-green-50 text-green-700" },
    { label: "Total Permintaan", value: requests.length, icon: ClipboardList, color: "bg-ams-red/10 text-ams-red" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ams-black">Dashboard</h1>
        <p className="text-sm text-ams-black/50">Ringkasan aktivitas pasien dan permintaan antibiotik</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-ams-white rounded-2xl p-5 flex flex-col gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ams-black">
                {isLoading ? "—" : value}
              </p>
              <p className="text-xs text-ams-black/50">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pasien Terbaru */}
        <div className="bg-ams-white rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ams-black">Pasien Terbaru</h2>
            <Link href="/doctor/patients" className="text-xs text-ams-red hover:underline flex items-center gap-1">
              Lihat semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-ams-gray rounded-xl animate-pulse" />
              ))}
            </div>
          ) : patients.length === 0 ? (
            <p className="text-sm text-ams-black/40 text-center py-6">Belum ada pasien</p>
          ) : (
            <div className="flex flex-col gap-2">
              {patients.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-ams-black/5 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-ams-black">{p.name}</p>
                    <p className="text-xs text-ams-black/40">{p.medRecNo}</p>
                  </div>
                  <Badge className={conditionConfig[p.condition].className}>
                    {conditionConfig[p.condition].label}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Permintaan Terbaru */}
        <div className="bg-ams-white rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ams-black">Permintaan Terbaru</h2>
            <Link href="/doctor/requests" className="text-xs text-ams-red hover:underline flex items-center gap-1">
              Lihat semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-ams-gray rounded-xl animate-pulse" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <p className="text-sm text-ams-black/40 text-center py-6">Belum ada permintaan</p>
          ) : (
            <div className="flex flex-col gap-2">
              {requests.slice(0, 5).map((r) => (
                <Link key={r.id} href={`/doctor/requests/${r.id}`} className="flex items-center justify-between py-2 border-b border-ams-black/5 last:border-0 hover:opacity-70 transition-opacity">
                  <div>
                    <p className="text-sm font-medium text-ams-black">{r.antibiotic?.name ?? "-"}</p>
                    <p className="text-xs text-ams-black/40">{r.patient?.name ?? "-"}</p>
                  </div>
                  <Badge className={statusConfig[r.status].className}>
                    {statusConfig[r.status].label}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
