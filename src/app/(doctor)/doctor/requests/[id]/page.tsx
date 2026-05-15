"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchCombobox } from "@/components/ui/search-combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { Antibiotic, AntibioticRequest, PaginatedResponse } from "@/types";

const statusConfig = {
  PENDING: { label: "Menunggu", className: "bg-ams-orange-light text-ams-orange border-ams-orange/20" },
  APPROVED: { label: "Disetujui", className: "bg-green-50 text-green-700 border-green-200" },
  REJECTED: { label: "Ditolak", className: "bg-red-50 text-ams-red border-ams-red/20" },
};

const editSchema = z.object({
  antibioticId: z.string().min(1, "Pilih antibiotik"),
  dosage: z.string().min(1, "Dosis wajib diisi"),
  frequency: z.string().min(1, "Frekuensi wajib diisi"),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().min(1, "Tanggal selesai wajib diisi"),
  notes: z.string().optional(),
});

type EditForm = z.infer<typeof editSchema>;

export default function DoctorRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [request, setRequest] = useState<AntibioticRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [antibioticDefaultLabel, setAntibioticDefaultLabel] = useState<string | undefined>();

  const editForm = useForm<EditForm>({ resolver: zodResolver(editSchema) });
  const searchAntibioticsRef = useRef<(q: string) => Promise<Antibiotic[]>>(async () => []);

  searchAntibioticsRef.current = async (query: string) => {
    const res = await api.get<PaginatedResponse<Antibiotic>>("/antibiotics", { search: query, limit: "10" });
    return res?.data ?? [];
  };

  useEffect(() => {
    async function fetchRequest() {
      try {
        const data = await api.get<AntibioticRequest>(`/antibiotic-requests/${id}`);
        setRequest(data);
      } catch {
        router.push("/doctor/requests");
      } finally {
        setIsLoading(false);
      }
    }
    fetchRequest();
  }, [id, router]);

  function openEditDialog() {
    if (!request) return;
    editForm.reset({
      antibioticId: request.antibioticId,
      dosage: request.dosage,
      frequency: request.frequency,
      startDate: new Date(request.startDate).toISOString().split("T")[0],
      endDate: new Date(request.endDate).toISOString().split("T")[0],
      notes: request.notes ?? "",
    });
    setAntibioticDefaultLabel(request.antibiotic?.name);
    setShowEditDialog(true);
  }

  async function handleEdit(data: EditForm) {
    setIsEditing(true);
    try {
      const updated = await api.patch<AntibioticRequest>(`/antibiotic-requests/${id}`, data);
      setRequest(updated);
      toast.success("Permintaan berhasil diperbarui");
      setShowEditDialog(false);
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? "Gagal memperbarui permintaan");
    } finally {
      setIsEditing(false);
    }
  }

  async function handleCancel() {
    setIsCanceling(true);
    try {
      await api.delete(`/antibiotic-requests/${id}`);
      toast.success("Permintaan berhasil dibatalkan");
      router.push("/doctor/requests");
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? "Gagal membatalkan permintaan");
    } finally {
      setIsCanceling(false);
      setShowCancelDialog(false);
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-ams-black/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-ams-black/60" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-ams-black">Detail Permintaan</h1>
            <p className="text-sm text-ams-black/50">ID: {request.id}</p>
          </div>
          <Badge className={status.className}>{status.label}</Badge>
        </div>
        {request.status === "PENDING" && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={openEditDialog}
              className="rounded-full border-ams-black/10 text-ams-black gap-2"
            >
              <Pencil className="w-4 h-4" /> Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(true)}
              className="rounded-full border-ams-red/20 text-ams-red hover:bg-ams-red/5 gap-2"
            >
              <Trash2 className="w-4 h-4" /> Batalkan
            </Button>
          </div>
        )}
      </div>

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
              <p className="text-xs text-ams-black/40 mb-1">Catatan</p>
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

      {/* Dialog Edit */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Permintaan</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEdit)} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Antibiotik</Label>
              <SearchCombobox<Antibiotic>
                placeholder="Cari antibiotik..."
                onSearch={(q) => searchAntibioticsRef.current(q)}
                getLabel={(a) => a.name}
                getValue={(a) => a.id}
                onChange={(val) => editForm.setValue("antibioticId", val)}
                defaultLabel={antibioticDefaultLabel}
              />
              {editForm.formState.errors.antibioticId && (
                <p className="text-xs text-ams-red">{editForm.formState.errors.antibioticId.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-ams-black/70">Dosis</Label>
                <Input placeholder="500 mg" {...editForm.register("dosage")} />
                {editForm.formState.errors.dosage && (
                  <p className="text-xs text-ams-red">{editForm.formState.errors.dosage.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-ams-black/70">Frekuensi</Label>
                <Input placeholder="3x sehari" {...editForm.register("frequency")} />
                {editForm.formState.errors.frequency && (
                  <p className="text-xs text-ams-red">{editForm.formState.errors.frequency.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-ams-black/70">Tanggal Mulai</Label>
                <Input type="date" {...editForm.register("startDate")} />
                {editForm.formState.errors.startDate && (
                  <p className="text-xs text-ams-red">{editForm.formState.errors.startDate.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-ams-black/70">Tanggal Selesai</Label>
                <Input type="date" {...editForm.register("endDate")} />
                {editForm.formState.errors.endDate && (
                  <p className="text-xs text-ams-red">{editForm.formState.errors.endDate.message}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Catatan (opsional)</Label>
              <Textarea placeholder="Catatan tambahan..." {...editForm.register("notes")} rows={2} />
            </div>
            <Button type="submit" disabled={isEditing} className="bg-ams-red hover:bg-ams-red/90 text-white rounded-full">
              {isEditing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Perubahan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Batalkan */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="rounded-2xl max-w-sm text-center flex flex-col items-center gap-4 py-8">
          <div className="w-14 h-14 rounded-full bg-ams-red/10 flex items-center justify-center">
            <Trash2 className="w-7 h-7 text-ams-red" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-ams-black">Batalkan permintaan ini?</p>
            <p className="text-sm text-ams-black/50">
              Permintaan akan dihapus dan tidak bisa dikembalikan.
            </p>
          </div>
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              className="flex-1 rounded-full border-ams-black/10"
            >
              Kembali
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isCanceling}
              className="flex-1 bg-ams-red hover:bg-ams-red/90 text-white rounded-full"
            >
              {isCanceling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ya, Batalkan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
