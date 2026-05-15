"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, UserPlus, Loader2, ShieldCheck, AlertCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useAuthStore } from "@/stores/auth.store";
import { Patient, PatientCondition } from "@/types";

const conditionConfig = {
  STABIL: { label: "Stabil", className: "bg-blue-50 text-blue-700 border-blue-200" },
  MEMBAIK: { label: "Membaik", className: "bg-green-50 text-green-700 border-green-200" },
  MEMBURUK: { label: "Memburuk", className: "bg-red-50 text-ams-red border-ams-red/20" },
  SELESAI: { label: "Selesai", className: "bg-ams-gray text-ams-black/50 border-ams-black/10" },
};

const addSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  birthDate: z.string().min(1, "Tanggal lahir wajib diisi"),
  gender: z.enum(["LAKI_LAKI", "PEREMPUAN"] as const, "Pilih jenis kelamin"),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  diagnosis: z.string().min(3, "Diagnosis minimal 3 karakter"),
});

const assignSchema = z.object({
  medRecNo: z.string().length(10, "No. RM harus 10 digit"),
});

type AddForm = z.infer<typeof addSchema>;
type AssignForm = z.infer<typeof assignSchema>;

export default function PatientsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifyState, setVerifyState] = useState<"idle" | "verifying" | "found" | "not_found">("idle");
  const [verifiedPatient, setVerifiedPatient] = useState<Patient | null>(null);

  const addForm = useForm<AddForm>({ resolver: zodResolver(addSchema) });
  const assignForm = useForm<AssignForm>({ resolver: zodResolver(assignSchema) });

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    try {
      const data = await api.get<Patient[]>("/patients");
      setPatients(data ?? []);
    } finally {
      setIsLoading(false);
    }
  }

  async function onAddSubmit(data: AddForm) {
    setIsSubmitting(true);
    try {
      const patient = await api.post<Patient>("/patients", data);
      setPatients((prev) => [patient, ...prev]);
      toast.success("Pasien berhasil ditambahkan");
      setShowAdd(false);
      addForm.reset();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? "Gagal menambahkan pasien");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onVerify(data: AssignForm) {
    setVerifyState("verifying");
    try {
      const patient = await api.get<Patient>(`/patients/medrec/${data.medRecNo}`);
      setVerifiedPatient(patient);
      setVerifyState("found");
    } catch {
      setVerifyState("not_found");
    }
  }

  async function onAssignConfirm() {
    if (!verifiedPatient) return;
    setIsSubmitting(true);
    try {
      const patient = await api.post<Patient>("/patients/assign", {
        medRecNo: assignForm.getValues("medRecNo"),
      });
      setPatients((prev) => {
        const exists = prev.find((p) => p.id === patient.id);
        return exists ? prev : [patient, ...prev];
      });
      toast.success("Pasien berhasil di-assign");
      handleCloseAssign();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? "Gagal assign pasien");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCloseAssign() {
    setShowAssign(false);
    setVerifyState("idle");
    setVerifiedPatient(null);
    assignForm.reset();
  }

  const filteredPatients = patients.filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.medRecNo.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ams-black">Pasien</h1>
          <p className="text-sm text-ams-black/50">Daftar pasien yang kamu tangani</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAssign(true)}
            variant="outline"
            className="rounded-full border-ams-black/10 text-ams-black gap-2"
          >
            <UserPlus className="w-4 h-4" /> Assign Pasien
          </Button>
          <Button
            onClick={() => setShowAdd(true)}
            className="bg-ams-red hover:bg-ams-red/90 text-white rounded-full gap-2"
          >
            <Plus className="w-4 h-4" /> Tambah Pasien
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ams-black/30" />
        <Input
          placeholder="Cari nama atau No. RM..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-full border-ams-black/10 bg-ams-white"
        />
      </div>

      <div className="bg-ams-white rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-5 h-5 animate-spin text-ams-red" />
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-ams-black/30">
            <p className="text-sm">{search ? "Pasien tidak ditemukan" : "Belum ada pasien"}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ams-black/5 text-ams-black/40 text-xs">
                <th className="text-left px-6 py-4 font-medium">Nama</th>
                <th className="text-left px-6 py-4 font-medium">No. RM</th>
                <th className="text-left px-6 py-4 font-medium">Diagnosis</th>
                <th className="text-left px-6 py-4 font-medium">Kondisi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((p) => (
                <tr key={p.id} onClick={() => router.push(`/doctor/patients/${p.id}`)} className="border-b border-ams-black/5 last:border-0 hover:bg-ams-gray/50 transition-colors cursor-pointer">
                  <td className="px-6 py-4">
                    <p className="font-medium text-ams-black">{p.name}</p>
                    <p className="text-xs text-ams-black/40">
                      {p.gender === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"} · {new Date(p.birthDate).toLocaleDateString("id-ID")}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-ams-black/70">{p.medRecNo}</td>
                  <td className="px-6 py-4 text-ams-black/70 max-w-xs truncate">{p.diagnosis}</td>
                  <td className="px-6 py-4">
                    <Badge className={conditionConfig[p.condition].className}>
                      {conditionConfig[p.condition].label}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Dialog Tambah Pasien */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Pasien Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Nama Lengkap</Label>
              <Input placeholder="Siti Rahayu" {...addForm.register("name")} />
              {addForm.formState.errors.name && <p className="text-xs text-ams-red">{addForm.formState.errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Tanggal Lahir</Label>
              <Input type="date" {...addForm.register("birthDate")} />
              {addForm.formState.errors.birthDate && <p className="text-xs text-ams-red">{addForm.formState.errors.birthDate.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Jenis Kelamin</Label>
              <Select onValueChange={(v) => addForm.setValue("gender", v as "LAKI_LAKI" | "PEREMPUAN")}>
                <SelectTrigger><SelectValue placeholder="Pilih jenis kelamin" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LAKI_LAKI">Laki-laki</SelectItem>
                  <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                </SelectContent>
              </Select>
              {addForm.formState.errors.gender && <p className="text-xs text-ams-red">{addForm.formState.errors.gender.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Alamat</Label>
              <Input placeholder="Jl. Merdeka No. 1" {...addForm.register("address")} />
              {addForm.formState.errors.address && <p className="text-xs text-ams-red">{addForm.formState.errors.address.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Diagnosis</Label>
              <Textarea placeholder="Infeksi saluran kemih" {...addForm.register("diagnosis")} rows={2} />
              {addForm.formState.errors.diagnosis && <p className="text-xs text-ams-red">{addForm.formState.errors.diagnosis.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting} className="bg-ams-red hover:bg-ams-red/90 text-white rounded-full">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tambah Pasien"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Assign Pasien */}
      <Dialog open={showAssign} onOpenChange={(open) => { if (!open) handleCloseAssign(); }}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Pasien via No. RM</DialogTitle>
          </DialogHeader>

          {verifyState !== "found" ? (
            <form onSubmit={assignForm.handleSubmit(onVerify)} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-ams-black/70">Nomor Rekam Medis</Label>
                <Input
                  placeholder="2607019993"
                  {...assignForm.register("medRecNo")}
                  onChange={(e) => {
                    assignForm.register("medRecNo").onChange(e);
                    if (verifyState === "not_found") setVerifyState("idle");
                  }}
                />
                {assignForm.formState.errors.medRecNo && (
                  <p className="text-xs text-ams-red">{assignForm.formState.errors.medRecNo.message}</p>
                )}
                {verifyState === "not_found" && (
                  <div className="flex items-center gap-2 text-ams-red text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>No. RM tidak terdaftar di sistem</span>
                  </div>
                )}
              </div>
              <Button type="submit" disabled={verifyState === "verifying"} className="bg-ams-red hover:bg-ams-red/90 text-white rounded-full">
                {verifyState === "verifying" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verifikasi"}
              </Button>
            </form>
          ) : verifiedPatient && (() => {
            const blockedByOtherDoctor =
              verifiedPatient.isActive &&
              verifiedPatient.doctor != null &&
              verifiedPatient.doctor.id !== user?.id;
            return (
            <div className="flex flex-col gap-4 mt-2">
              {/* Info pasien */}
              <div className="bg-ams-gray rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ams-black">{verifiedPatient.name}</p>
                    <p className="text-xs text-ams-black/50">No. RM: {verifiedPatient.medRecNo}</p>
                  </div>
                  <Badge className={conditionConfig[verifiedPatient.condition as PatientCondition].className}>
                    {conditionConfig[verifiedPatient.condition as PatientCondition].label}
                  </Badge>
                </div>
                <div className="text-xs text-ams-black/60 flex flex-col gap-0.5">
                  <span>{verifiedPatient.gender === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"} · {new Date(verifiedPatient.birthDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                  <span className="line-clamp-2">{verifiedPatient.diagnosis}</span>
                  {verifiedPatient.doctor && (
                    <span className="text-ams-black/40">Dokter: {verifiedPatient.doctor.name}</span>
                  )}
                </div>
              </div>

              {/* Warning pasien aktif di dokter lain */}
              {blockedByOtherDoctor && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Pasien sedang aktif di bawah <strong>{verifiedPatient.doctor!.name}</strong>. Nonaktifkan pasien terlebih dahulu.</span>
                </div>
              )}

              {/* Riwayat kondisi */}
              {(verifiedPatient.conditionLogs?.length ?? 0) > 0 && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold text-ams-black/50 uppercase tracking-wide">Riwayat Kondisi</p>
                  <div className="flex flex-col gap-2">
                    {verifiedPatient.conditionLogs!.slice(0, 3).map((log) => (
                      <div key={log.id} className="flex items-start gap-2 text-xs text-ams-black/70">
                        <Badge className={`${conditionConfig[log.condition as PatientCondition].className} shrink-0`}>
                          {conditionConfig[log.condition as PatientCondition].label}
                        </Badge>
                        <span className="line-clamp-1 flex-1">{log.notes}</span>
                        <span className="text-ams-black/30 shrink-0">{new Date(log.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button variant="outline" onClick={() => setVerifyState("idle")} className="flex-1 rounded-full border-ams-black/10">
                  Batal
                </Button>
                <Button onClick={onAssignConfirm} disabled={isSubmitting || blockedByOtherDoctor} className="flex-1 bg-ams-red hover:bg-ams-red/90 text-white rounded-full gap-2 disabled:opacity-40">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /> Assign Pasien</>}
                </Button>
              </div>
            </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
