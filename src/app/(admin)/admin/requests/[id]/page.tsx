"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { AntibioticRequest } from "@/types";

const statusConfig = {
  PENDING: { label: "Menunggu", className: "bg-ams-orange-light text-ams-orange border-ams-orange/20" },
  APPROVED: { label: "Disetujui", className: "bg-green-50 text-green-700 border-green-200" },
  REJECTED: { label: "Ditolak", className: "bg-red-50 text-ams-red border-ams-red/20" },
};

export default function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const [request, setRequest] = useState<AntibioticRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchRequest() {
      try {
        const data = await api.get<AntibioticRequest>(`/antibiotic-requests/${id}`);
        setRequest(data);
      } catch {
        router.push("/admin/requests");
      } finally {
        setIsLoading(false);
      }
    }
    fetchRequest();
  }, [id, router]);

  async function handleClaim() {
    setIsSubmitting(true);
    try {
      const data = await api.patch<AntibioticRequest>(`/antibiotic-requests/${id}/claim`);
      setRequest(data);
      toast.success("Request berhasil di-claim");
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? "Gagal claim request");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUnclaim() {
    setIsSubmitting(true);
    try {
      const data = await api.patch<AntibioticRequest>(`/antibiotic-requests/${id}/unclaim`);
      setRequest(data);
      toast.success("Request dikembalikan ke pool");
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? "Gagal unclaim request");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReview(status: "APPROVED" | "REJECTED") {
    if (!reviewNotes.trim()) {
      toast.error("Catatan review tidak boleh kosong");
      return;
    }
    setIsSubmitting(true);
    try {
      const data = await api.patch<AntibioticRequest>(`/antibiotic-requests/${id}/review`, {
        status,
        reviewNotes,
      });
      setRequest(data);
      toast.success(status === "APPROVED" ? "Request disetujui" : "Request ditolak");
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? "Gagal review request");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-ams-red" />
      </div>
    );
  }

  if (!request) return null;

  const status = statusConfig[request.status];
  const isClaimed = !!request.assignedAdmin;
  const isMyRequest = request.assignedAdmin?.id === user?.id;
  const canReview = isClaimed && isMyRequest && request.status === "PENDING";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-ams-black/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-ams-black/60" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-ams-black">Detail Permintaan</h1>
          <p className="text-sm text-ams-black/50">
            Diajukan oleh: {request.doctor?.name ?? "-"}
          </p>
        </div>
        <Badge className={status.className}>{status.label}</Badge>
      </div>

      {/* Aksi Claim / Review */}
      {request.status === "PENDING" && (
        <div className="bg-ams-white rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-ams-black">Tindakan</h2>

          {!isClaimed && (
            <div className="flex items-center gap-3">
              <p className="text-sm text-ams-black/60">Request belum di-claim.</p>
              <Button
                onClick={handleClaim}
                disabled={isSubmitting}
                className="bg-ams-blue hover:bg-ams-blue/90 text-white rounded-full"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Claim Request"}
              </Button>
            </div>
          )}

          {isClaimed && !isMyRequest && (
            <p className="text-sm text-ams-black/60">
              Sudah di-claim oleh: <span className="font-medium text-ams-black">{request.assignedAdmin?.name}</span>
            </p>
          )}

          {canReview && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-ams-black/60">
                  Di-claim oleh kamu. Tulis catatan lalu berikan keputusan.
                </p>
                <button
                  onClick={handleUnclaim}
                  disabled={isSubmitting}
                  className="text-xs text-ams-black/40 hover:text-ams-red transition-colors"
                >
                  Lepas claim
                </button>
              </div>
              <Textarea
                placeholder="Tulis catatan review..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="bg-ams-gray border-ams-black/10 resize-none"
                rows={3}
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => handleReview("APPROVED")}
                  disabled={isSubmitting}
                  className="bg-ams-green hover:bg-ams-green/90 text-white rounded-full"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Setujui"}
                </Button>
                <Button
                  onClick={() => handleReview("REJECTED")}
                  disabled={isSubmitting}
                  variant="outline"
                  className="border-ams-red text-ams-red hover:bg-ams-red hover:text-white rounded-full"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tolak"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Info Antibiotik */}
        <div className="bg-ams-white rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-ams-black">Informasi Antibiotik</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoRow label="Antibiotik" value={request.antibiotic?.name ?? "-"} />
            <InfoRow label="Dosis" value={request.dosage} />
            <InfoRow label="Frekuensi" value={request.frequency} />
            <InfoRow label="Mulai" value={new Date(request.startDate).toLocaleDateString("id-ID")} />
            <InfoRow label="Selesai" value={new Date(request.endDate).toLocaleDateString("id-ID")} />
          </div>
          {request.notes && (
            <div>
              <p className="text-xs text-ams-black/40 mb-1">Catatan Dokter</p>
              <p className="text-sm text-ams-black/70">{request.notes}</p>
            </div>
          )}
          {request.reviewNotes && (
            <div className="bg-ams-gray rounded-xl p-4">
              <p className="text-xs font-semibold text-ams-black/40 mb-1">Catatan Review</p>
              <p className="text-sm text-ams-black/70">{request.reviewNotes}</p>
            </div>
          )}
        </div>

        {/* Info Pasien */}
        <div className="bg-ams-white rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-ams-black">Informasi Pasien</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoRow label="Nama" value={request.patient?.name ?? "-"} />
            <InfoRow label="No. RM" value={request.patient?.medRecNo ?? "-"} />
            <InfoRow label="Diagnosis" value={request.clinicalData.diagnosis} />
          </div>
        </div>
      </div>

      {/* Data Klinis */}
      <div className="bg-ams-white rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="font-semibold text-ams-black">Data Klinis</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <InfoRow label="Tekanan Darah" value={request.clinicalData.bloodPressure} />
          <InfoRow label="Detak Jantung" value={`${request.clinicalData.heartRate} bpm`} />
          <InfoRow label="Suhu" value={`${request.clinicalData.temperature} °C`} />
          <InfoRow label="Laju Napas" value={`${request.clinicalData.respiratoryRate} x/mnt`} />
          <InfoRow label="Saturasi O₂" value={`${request.clinicalData.oxygenSaturation}%`} />
          <InfoRow label="Leukosit" value={`${request.clinicalData.leukocytes} rb/µL`} />
          <InfoRow label="Neutrofil" value={`${request.clinicalData.neutrophils}%`} />
          <InfoRow label="Limfosit" value={`${request.clinicalData.lymphocytes}%`} />
          <InfoRow label="Ureum" value={`${request.clinicalData.ureum} mg/dL`} />
          <InfoRow label="Kreatinin" value={`${request.clinicalData.creatinine} mg/dL`} />
          <InfoRow label="SGOT" value={`${request.clinicalData.sgot} U/L`} />
          <InfoRow label="SGPT" value={`${request.clinicalData.sgpt} U/L`} />
          <InfoRow label="Albumin" value={`${request.clinicalData.albumin} g/dL`} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <InfoRow label="Kondisi Umum" value={request.clinicalData.generalCondition} />
          <InfoRow label="Pemeriksaan Fisik" value={request.clinicalData.physicalExamination} />
          <InfoRow label="Urinalisis" value={request.clinicalData.urinalysis} />
        </div>
        {request.clinicalData.imagingType && (
          <div className="flex flex-col gap-1">
            <p className="text-xs text-ams-black/40">{request.clinicalData.imagingType}</p>
            <a
              href={request.clinicalData.imagingResult}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ams-blue hover:underline"
            >
              Lihat hasil imaging
            </a>
          </div>
        )}
        {request.clinicalData.cultureResult && (
          <div className="flex flex-col gap-1">
            <p className="text-xs text-ams-black/40">Hasil Kultur</p>
            <a
              href={request.clinicalData.cultureResult}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ams-blue hover:underline"
            >
              Lihat hasil kultur
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-ams-black/40">{label}</p>
      <p className="font-medium text-ams-black">{value}</p>
    </div>
  );
}
