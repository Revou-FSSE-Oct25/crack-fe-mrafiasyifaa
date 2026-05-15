"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Upload, FileText, ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchCombobox } from "@/components/ui/search-combobox";
import { api } from "@/lib/api";
import { uploadFile } from "@/lib/supabase";
import { Patient, Antibiotic, PaginatedResponse } from "@/types";

const requestSchema = z.object({
  patientId: z.string().min(1, "Pilih pasien"),
  antibioticId: z.string().min(1, "Pilih antibiotik"),
  dosage: z.string().min(1, "Dosis wajib diisi"),
  frequency: z.string().min(1, "Frekuensi wajib diisi"),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().min(1, "Tanggal selesai wajib diisi"),
  notes: z.string().optional(),
  clinicalData: z.object({
    diagnosis: z.string().min(3, "Diagnosis wajib diisi"),
    bloodPressure: z.string().min(1, "Tekanan darah wajib diisi"),
    heartRate: z.number().min(1, "Detak jantung wajib diisi"),
    temperature: z.number().min(30, "Suhu tidak valid"),
    respiratoryRate: z.number().min(1, "Laju napas wajib diisi"),
    oxygenSaturation: z.number().min(1).max(100, "Saturasi 0-100"),
    generalCondition: z.string().min(1, "Kondisi umum wajib diisi"),
    physicalExamination: z.string().min(1, "Pemeriksaan fisik wajib diisi"),
    leukocytes: z.number().min(0),
    neutrophils: z.number().min(0).max(100),
    lymphocytes: z.number().min(0).max(100),
    urinalysis: z.string().min(1, "Urinalisis wajib diisi"),
    ureum: z.number().min(0),
    creatinine: z.number().min(0),
    sgot: z.number().min(0),
    sgpt: z.number().min(0),
    albumin: z.number().min(0),
    imagingType: z.string().optional(),
    imagingResult: z.string().optional(),
    cultureResult: z.string().optional(),
  }),
});

type RequestForm = z.infer<typeof requestSchema>;

export default function NewRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillPatientId = searchParams.get("patientId");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImaging, setUploadingImaging] = useState(false);
  const [uploadingCulture, setUploadingCulture] = useState(false);
  const [imagingFileName, setImagingFileName] = useState<string | null>(null);
  const [cultureFileName, setCultureFileName] = useState<string | null>(null);
  const [imagingError, setImagingError] = useState(false);
  const [cultureError, setCultureError] = useState(false);
  const [patientDefaultLabel, setPatientDefaultLabel] = useState<string | undefined>();
  const [antibioticHighlight, setAntibioticHighlight] = useState(!!prefillPatientId);

  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<RequestForm>({ resolver: zodResolver(requestSchema) });

  const searchPatients = useCallback(async (query: string): Promise<Patient[]> => {
    return api.get<Patient[]>("/patients", { search: query, limit: "10" });
  }, []);

  const searchAntibiotics = useCallback(async (query: string): Promise<Antibiotic[]> => {
    const res = await api.get<PaginatedResponse<Antibiotic>>("/antibiotics", { search: query, limit: "10" });
    return res.data;
  }, []);

  useEffect(() => {
    if (!prefillPatientId) return;
    const pid = prefillPatientId;
    async function prefill() {
      try {
        const patient = await api.get<Patient>(`/patients/${pid}`);
        setPatientDefaultLabel(`${patient.name} — ${patient.medRecNo}`);
        setValue("patientId", pid);
        if (patient.diagnosis) setValue("clinicalData.diagnosis", patient.diagnosis);
      } catch {}
    }
    prefill();
  }, [prefillPatientId, setValue]);

  async function handleFileUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    field: "clinicalData.imagingResult" | "clinicalData.cultureResult",
    setUploading: (v: boolean) => void,
    setFileName: (name: string | null) => void,
    setError: (v: boolean) => void
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError(false);
    setUploading(true);
    try {
      const url = await uploadFile(file, field.includes("imaging") ? "imaging" : "culture");
      setValue(field, url);
    } catch {
      setError(true);
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: RequestForm) {
    setIsSubmitting(true);
    try {
      await api.post("/antibiotic-requests", data);
      toast.success("Permintaan berhasil dikirim");
      router.push("/doctor/requests");
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? "Gagal mengirim permintaan");
    } finally {
      setIsSubmitting(false);
    }
  }

  const imagingResult = watch("clinicalData.imagingResult");
  const cultureResult = watch("clinicalData.cultureResult");

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-ams-black/5 transition-colors">
          <ArrowLeft className="w-5 h-5 text-ams-black/60" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ams-black">Buat Permintaan Antibiotik</h1>
          <p className="text-sm text-ams-black/50">Isi data lengkap untuk pengajuan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

        {/* Info Dasar */}
        <div className="bg-ams-white rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-ams-black">Informasi Permintaan</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Pasien</Label>
              <SearchCombobox<Patient>
                placeholder="Cari nama pasien..."
                onSearch={searchPatients}
                getLabel={(p) => `${p.name} — ${p.medRecNo}`}
                getValue={(p) => p.id}
                defaultLabel={patientDefaultLabel}
                onChange={(v) => setValue("patientId", v)}
                onSelectItem={(p) => {
                  if (p.diagnosis) setValue("clinicalData.diagnosis", p.diagnosis);
                }}
              />
              {errors.patientId && <p className="text-xs text-ams-red">{errors.patientId.message as string}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">
                Antibiotik
                {antibioticHighlight && (
                  <span className="ml-2 text-xs font-normal text-orange-500">— pilih antibiotik pengganti</span>
                )}
              </Label>
              <div className={antibioticHighlight ? "ring-2 ring-orange-400 ring-offset-1 rounded-md" : ""}>
                <SearchCombobox<Antibiotic>
                  placeholder="Cari nama antibiotik..."
                  onSearch={searchAntibiotics}
                  getLabel={(a) => `${a.name} — ${a.form}`}
                  getValue={(a) => a.id}
                  onChange={(v) => { setValue("antibioticId", v); if (v) setAntibioticHighlight(false); }}
                />
              </div>
              {errors.antibioticId && <p className="text-xs text-ams-red">{errors.antibioticId.message as string}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Dosis</Label>
              <Input placeholder="500mg" {...register("dosage")} />
              {errors.dosage && <p className="text-xs text-ams-red">{errors.dosage.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Frekuensi</Label>
              <Input placeholder="3x sehari" {...register("frequency")} />
              {errors.frequency && <p className="text-xs text-ams-red">{errors.frequency.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Tanggal Mulai</Label>
              <Input type="date" {...register("startDate")} />
              {errors.startDate && <p className="text-xs text-ams-red">{errors.startDate.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Tanggal Selesai</Label>
              <Input type="date" {...register("endDate")} />
              {errors.endDate && <p className="text-xs text-ams-red">{errors.endDate.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-ams-black/70">Catatan (opsional)</Label>
            <Textarea placeholder="Misal: pasien alergi penisilin" {...register("notes")} rows={2} />
          </div>
        </div>

        {/* Data Klinis - Vital Signs */}
        <div className="bg-ams-white rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-ams-black">Tanda Vital</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Tekanan Darah</Label>
              <Input placeholder="120/80" {...register("clinicalData.bloodPressure")} />
              {errors.clinicalData?.bloodPressure && <p className="text-xs text-ams-red">{errors.clinicalData.bloodPressure.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Detak Jantung (bpm)</Label>
              <Input type="number" placeholder="80" {...register("clinicalData.heartRate", { valueAsNumber: true })} />
              {errors.clinicalData?.heartRate && <p className="text-xs text-ams-red">{errors.clinicalData.heartRate.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Suhu (°C)</Label>
              <Input type="number" step="0.1" placeholder="37.5" {...register("clinicalData.temperature", { valueAsNumber: true })} />
              {errors.clinicalData?.temperature && <p className="text-xs text-ams-red">{errors.clinicalData.temperature.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Laju Napas (x/mnt)</Label>
              <Input type="number" placeholder="20" {...register("clinicalData.respiratoryRate", { valueAsNumber: true })} />
              {errors.clinicalData?.respiratoryRate && <p className="text-xs text-ams-red">{errors.clinicalData.respiratoryRate.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Saturasi O₂ (%)</Label>
              <Input type="number" placeholder="98" {...register("clinicalData.oxygenSaturation", { valueAsNumber: true })} />
              {errors.clinicalData?.oxygenSaturation && <p className="text-xs text-ams-red">{errors.clinicalData.oxygenSaturation.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Kondisi Umum</Label>
              <Input placeholder="Lemah, composmentis" {...register("clinicalData.generalCondition")} />
              {errors.clinicalData?.generalCondition && <p className="text-xs text-ams-red">{errors.clinicalData.generalCondition.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Pemeriksaan Fisik</Label>
              <Input placeholder="Nyeri tekan epigastrium" {...register("clinicalData.physicalExamination")} />
              {errors.clinicalData?.physicalExamination && <p className="text-xs text-ams-red">{errors.clinicalData.physicalExamination.message}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-ams-black/70">Diagnosis Klinis</Label>
            <Input placeholder="Infeksi saluran kemih" {...register("clinicalData.diagnosis")} />
            {errors.clinicalData?.diagnosis && <p className="text-xs text-ams-red">{errors.clinicalData.diagnosis.message}</p>}
          </div>
        </div>

        {/* Data Lab */}
        <div className="bg-ams-white rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-ams-black">Data Laboratorium</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Leukosit (rb/µL)", field: "clinicalData.leukocytes", placeholder: "12.5" },
              { label: "Neutrofil (%)", field: "clinicalData.neutrophils", placeholder: "80" },
              { label: "Limfosit (%)", field: "clinicalData.lymphocytes", placeholder: "15" },
              { label: "Ureum (mg/dL)", field: "clinicalData.ureum", placeholder: "25" },
              { label: "Kreatinin (mg/dL)", field: "clinicalData.creatinine", placeholder: "0.9" },
              { label: "SGOT (U/L)", field: "clinicalData.sgot", placeholder: "22" },
              { label: "SGPT (U/L)", field: "clinicalData.sgpt", placeholder: "18" },
              { label: "Albumin (g/dL)", field: "clinicalData.albumin", placeholder: "4.0" },
            ].map(({ label, field, placeholder }) => (
              <div key={field} className="flex flex-col gap-1.5">
                <Label className="text-sm text-ams-black/70">{label}</Label>
                <Input type="number" step="0.01" placeholder={placeholder} {...register(field as keyof RequestForm, { valueAsNumber: true })} />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-ams-black/70">Urinalisis</Label>
            <Input placeholder="Leukosit +3, nitrit positif" {...register("clinicalData.urinalysis")} />
            {errors.clinicalData?.urinalysis && <p className="text-xs text-ams-red">{errors.clinicalData.urinalysis.message}</p>}
          </div>
        </div>

        {/* Upload File */}
        <div className="bg-ams-white rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-ams-black">Dokumen Pendukung (opsional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-ams-black/70">Jenis Imaging</Label>
                <Input placeholder="USG Abdomen, Rontgen, dll" {...register("clinicalData.imagingType")} />
              </div>
              <Label className="text-sm text-ams-black/70">Hasil Imaging</Label>
              <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                imagingResult ? "border-green-400 bg-green-50" :
                imagingError ? "border-ams-red/50 bg-red-50" :
                "border-ams-black/10 hover:border-ams-red/30"
              }`}>
                {uploadingImaging ? (
                  <Loader2 className="w-4 h-4 animate-spin text-ams-red shrink-0" />
                ) : imagingError ? (
                  <AlertCircle className="w-4 h-4 text-ams-red shrink-0" />
                ) : imagingResult ? (
                  imagingFileName?.toLowerCase().endsWith(".pdf")
                    ? <FileText className="w-4 h-4 text-green-600 shrink-0" />
                    : <ImageIcon className="w-4 h-4 text-green-600 shrink-0" />
                ) : (
                  <Upload className="w-4 h-4 text-ams-black/40 shrink-0" />
                )}
                <div className="flex flex-col flex-1 min-w-0">
                  <span className={`text-sm truncate ${
                    imagingResult ? "text-green-700 font-medium" :
                    imagingError ? "text-ams-red font-medium" :
                    uploadingImaging ? "text-ams-black/50" : "text-ams-black/40"
                  }`}>
                    {uploadingImaging
                      ? `Mengupload ${imagingFileName}...`
                      : imagingResult
                      ? imagingFileName
                      : imagingError
                      ? imagingFileName
                      : "Upload PDF / gambar"}
                  </span>
                  {imagingError && (
                    <span className="text-xs text-ams-red/70">Gagal diupload · klik untuk coba lagi</span>
                  )}
                </div>
                {imagingResult && <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "clinicalData.imagingResult", setUploadingImaging, setImagingFileName, setImagingError)}
                />
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm text-ams-black/70 mt-6 md:mt-0 block">Hasil Kultur</Label>
              <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all mt-auto ${
                cultureResult ? "border-green-400 bg-green-50" :
                cultureError ? "border-ams-red/50 bg-red-50" :
                "border-ams-black/10 hover:border-ams-red/30"
              }`}>
                {uploadingCulture ? (
                  <Loader2 className="w-4 h-4 animate-spin text-ams-red shrink-0" />
                ) : cultureError ? (
                  <AlertCircle className="w-4 h-4 text-ams-red shrink-0" />
                ) : cultureResult ? (
                  cultureFileName?.toLowerCase().endsWith(".pdf")
                    ? <FileText className="w-4 h-4 text-green-600 shrink-0" />
                    : <ImageIcon className="w-4 h-4 text-green-600 shrink-0" />
                ) : (
                  <Upload className="w-4 h-4 text-ams-black/40 shrink-0" />
                )}
                <div className="flex flex-col flex-1 min-w-0">
                  <span className={`text-sm truncate ${
                    cultureResult ? "text-green-700 font-medium" :
                    cultureError ? "text-ams-red font-medium" :
                    uploadingCulture ? "text-ams-black/50" : "text-ams-black/40"
                  }`}>
                    {uploadingCulture
                      ? `Mengupload ${cultureFileName}...`
                      : cultureResult
                      ? cultureFileName
                      : cultureError
                      ? cultureFileName
                      : "Upload PDF / gambar"}
                  </span>
                  {cultureError && (
                    <span className="text-xs text-ams-red/70">Gagal diupload · klik untuk coba lagi</span>
                  )}
                </div>
                {cultureResult && <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "clinicalData.cultureResult", setUploadingCulture, setCultureFileName, setCultureError)}
                />
              </label>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-ams-red hover:bg-ams-red/90 text-white font-semibold rounded-full py-3"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kirim Permintaan"}
        </Button>
      </form>
    </div>
  );
}
