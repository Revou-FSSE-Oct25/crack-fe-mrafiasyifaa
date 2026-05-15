"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { AntibioticRequest, RequestStatus } from "@/types";

const statusConfig = {
  PENDING: { label: "Menunggu", className: "bg-ams-orange-light text-ams-orange border-ams-orange/20" },
  APPROVED: { label: "Disetujui", className: "bg-green-50 text-green-700 border-green-200" },
  REJECTED: { label: "Ditolak", className: "bg-red-50 text-ams-red border-ams-red/20" },
};

const filters: { label: string; value: RequestStatus | "ALL" }[] = [
  { label: "Semua", value: "ALL" },
  { label: "Menunggu", value: "PENDING" },
  { label: "Disetujui", value: "APPROVED" },
  { label: "Ditolak", value: "REJECTED" },
];

export default function DoctorRequestsPage() {
  const [requests, setRequests] = useState<AntibioticRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<RequestStatus | "ALL">("ALL");

  useEffect(() => {
    async function fetchRequests() {
      try {
        const params = activeFilter !== "ALL" ? { status: activeFilter } : undefined;
        const data = await api.get<AntibioticRequest[]>("/antibiotic-requests", params);
        setRequests(data ?? []);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRequests();
  }, [activeFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ams-black">Permintaan Antibiotik</h1>
          <p className="text-sm text-ams-black/50">Riwayat permintaan antibiotik yang kamu ajukan</p>
        </div>
        <Link href="/doctor/requests/new">
          <Button className="bg-ams-red hover:bg-ams-red/90 text-white rounded-full gap-2">
            <Plus className="w-4 h-4" /> Buat Permintaan
          </Button>
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {filters.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => { setActiveFilter(value); setIsLoading(true); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === value
                ? "bg-ams-red text-white"
                : "bg-ams-white text-ams-black/60 hover:text-ams-black"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-ams-white rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-5 h-5 animate-spin text-ams-red" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-ams-black/30">
            <p className="text-sm">Belum ada permintaan</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ams-black/5 text-ams-black/40 text-xs">
                <th className="text-left px-6 py-4 font-medium">Antibiotik</th>
                <th className="text-left px-6 py-4 font-medium">Pasien</th>
                <th className="text-left px-6 py-4 font-medium">Dosis</th>
                <th className="text-left px-6 py-4 font-medium">Tanggal</th>
                <th className="text-left px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-ams-black/5 last:border-0 hover:bg-ams-gray/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <Link href={`/doctor/requests/${r.id}`} className="block">
                      <p className="font-medium text-ams-black">{r.antibiotic?.name ?? "-"}</p>
                      <p className="text-xs text-ams-black/40">{r.frequency}</p>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-ams-black/70">
                    <Link href={`/doctor/requests/${r.id}`} className="block">
                      {r.patient?.name ?? "-"}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-ams-black/70">
                    <Link href={`/doctor/requests/${r.id}`} className="block">
                      {r.dosage}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-ams-black/70">
                    <Link href={`/doctor/requests/${r.id}`} className="block">
                      {new Date(r.createdAt).toLocaleDateString("id-ID")}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/doctor/requests/${r.id}`} className="block">
                      <Badge className={statusConfig[r.status].className}>
                        {statusConfig[r.status].label}
                      </Badge>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
