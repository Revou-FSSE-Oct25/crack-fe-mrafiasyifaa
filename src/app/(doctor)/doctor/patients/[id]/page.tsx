"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ClipboardList, Plus, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { Patient, PatientCondition, ConditionLog } from "@/types";

const conditionConfig: Record<PatientCondition, { label: string; className: string }> = {
  STABIL: { label: "Stabil", className: "bg-blue-50 text-blue-700 border-blue-200" },
  MEMBAIK: { label: "Membaik", className: "bg-green-50 text-green-700 border-green-200" },
  MEMBURUK: { label: "Memburuk", className: "bg-red-50 text-ams-red border-ams-red/20" },
  SELESAI: { label: "Selesai", className: "bg-ams-gray text-ams-black/50 border-ams-black/10" },
};

const updateSchema = z.object({
  condition: z.enum(["STABIL", "MEMBAIK", "MEMBURUK", "SELESAI"] as const, "Pilih kondisi"),
  notes: z.string().min(5, "Catatan minimal 5 karakter"),
});

type UpdateForm = z.infer<typeof updateSchema>;

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [logs, setLogs] = useState<ConditionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const form = useForm<UpdateForm>({ resolver: zodResolver(updateSchema) });

  useEffect(() => {
    async function fetchPatient() {
      try {
        const data = await api.get<Patient>(`/patients/${id}`);
        setPatient(data);
        setLogs(data.conditionLogs ?? []);
      } catch {
        toast.error("Gagal memuat data pasien");
        router.push("/doctor/patients");
      } finally {
        setIsLoading(false);
      }
    }
    fetchPatient();
  }, [id, router]);

  async function onSubmit(data: UpdateForm) {
    setIsSubmitting(true);
    try {
      const updated = await api.patch<Patient>(`/patients/${id}/condition`, data);
      setPatient(updated);
      setLogs(updated.conditionLogs ?? []);
      toast.success("Kondisi pasien berhasil diperbarui");
      setShowDialog(false);
      form.reset();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? "Gagal memperbarui kondisi");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeactivate() {
    setIsDeactivating(true);
    try {
      await api.patch(`/patients/${id}/deactivate`);
      toast.success("Pasien berhasil dinonaktifkan");
      router.push("/doctor/patients");
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? "Gagal menonaktifkan pasien");
    } finally {
      setIsDeactivating(false);
      setShowDeactivateDialog(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 animate-spin text-ams-red" />
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-ams-black/5 transition-colors text-ams-black/40 hover:text-ams-black"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-ams-black">{patient.name}</h1>
            <p className="text-sm text-ams-black/50">No. RM: {patient.medRecNo}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!patient.isActive && (
            <span className="text-xs font-semibold text-ams-black/40 bg-ams-black/5 px-3 py-1.5 rounded-full">
              Pasien Nonaktif
            </span>
          )}
          {patient.isActive && patient.condition === "SELESAI" && (
            <Button
              onClick={() => setShowDeactivateDialog(true)}
              variant="outline"
              className="rounded-full border-ams-black/10 text-ams-black/60 gap-2 hover:border-ams-red/30 hover:text-ams-red"
            >
              <UserX className="w-4 h-4" /> Nonaktifkan Pasien
            </Button>
          )}
          {patient.isActive && (
            <Button
              onClick={() => setShowDialog(true)}
              className="bg-ams-red hover:bg-ams-red/90 text-white rounded-full gap-2"
            >
              <ClipboardList className="w-4 h-4" /> Update Kondisi
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Info Pasien */}
        <div className="md:col-span-1 bg-ams-white rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-ams-black">Informasi Pasien</h2>
          <div className="flex flex-col gap-3 text-sm">
            <div>
              <p className="text-ams-black/40 text-xs mb-0.5">Kondisi Saat Ini</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={conditionConfig[patient.condition].className}>
                  {conditionConfig[patient.condition].label}
                </Badge>
                {patient.condition === "MEMBURUK" && (
                  <button
                    onClick={() => router.push(`/doctor/requests/new?patientId=${id}`)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 hover:underline"
                  >
                    <Plus className="w-3 h-3" /> Antibiotik baru
                  </button>
                )}
              </div>
            </div>
            <div>
              <p className="text-ams-black/40 text-xs mb-0.5">Jenis Kelamin</p>
              <p className="text-ams-black">{patient.gender === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}</p>
            </div>
            <div>
              <p className="text-ams-black/40 text-xs mb-0.5">Tanggal Lahir</p>
              <p className="text-ams-black">{new Date(patient.birthDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            <div>
              <p className="text-ams-black/40 text-xs mb-0.5">Alamat</p>
              <p className="text-ams-black">{patient.address}</p>
            </div>
            <div>
              <p className="text-ams-black/40 text-xs mb-0.5">Diagnosis</p>
              <p className="text-ams-black">{patient.diagnosis}</p>
            </div>
          </div>
        </div>

        {/* Riwayat Kondisi */}
        <div className="md:col-span-2 bg-ams-white rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-ams-black">Riwayat Kondisi</h2>
          {logs.length === 0 ? (
            <p className="text-sm text-ams-black/40 text-center py-8">Belum ada riwayat kondisi</p>
          ) : (
            <div className="flex flex-col gap-3">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-4 py-3 border-b border-ams-black/5 last:border-0">
                  <div className="flex flex-col items-center gap-1 pt-0.5">
                    <div className="w-2 h-2 rounded-full bg-ams-red shrink-0" />
                    <div className="w-px flex-1 bg-ams-black/10" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1 pb-1">
                    <div className="flex items-center justify-between gap-2">
                      <Badge className={`text-xs ${conditionConfig[log.condition].className}`}>
                        {conditionConfig[log.condition].label}
                      </Badge>
                      <span className="text-xs text-ams-black/40">
                        {new Date(log.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-sm text-ams-black/70">{log.notes}</p>
                    {log.doctor?.name && (
                      <p className="text-xs text-ams-black/30">oleh {log.doctor.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog Konfirmasi Nonaktifkan */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent className="rounded-2xl max-w-sm text-center flex flex-col items-center gap-4 py-8">
          <div className="w-14 h-14 rounded-full bg-ams-black/5 flex items-center justify-center">
            <UserX className="w-7 h-7 text-ams-black/40" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-ams-black">Nonaktifkan {patient.name}?</p>
            <p className="text-sm text-ams-black/50">
              Pasien tidak akan muncul di daftar aktif. Bisa diaktifkan kembali dengan assign ulang.
            </p>
          </div>
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)} className="flex-1 rounded-full border-ams-black/10">
              Batal
            </Button>
            <Button onClick={handleDeactivate} disabled={isDeactivating} className="flex-1 bg-ams-red hover:bg-ams-red/90 text-white rounded-full">
              {isDeactivating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Nonaktifkan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Update Kondisi */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Update Kondisi Pasien</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Kondisi</Label>
              <Select onValueChange={(v) => form.setValue("condition", v as PatientCondition)}>
                <SelectTrigger><SelectValue placeholder="Pilih kondisi" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STABIL">Stabil</SelectItem>
                  <SelectItem value="MEMBAIK">Membaik</SelectItem>
                  <SelectItem value="MEMBURUK">Memburuk</SelectItem>
                  <SelectItem value="SELESAI">Selesai</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.condition && (
                <p className="text-xs text-ams-red">{form.formState.errors.condition.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Catatan</Label>
              <Textarea
                placeholder="Pasien menunjukkan perbaikan setelah pemberian antibiotik..."
                {...form.register("notes")}
                rows={3}
              />
              {form.formState.errors.notes && (
                <p className="text-xs text-ams-red">{form.formState.errors.notes.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting} className="bg-ams-red hover:bg-ams-red/90 text-white rounded-full">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
