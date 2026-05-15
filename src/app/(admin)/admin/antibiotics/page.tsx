"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
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
import { Antibiotic, AntibioticCategory, AntibioticForm, PaginatedResponse } from "@/types";

const CATEGORIES: AntibioticCategory[] = ["KOMERSIAL", "DIAWASI", "RISET"];
const FORMS: AntibioticForm[] = ["TABLET", "KAPSUL", "SIRUP", "INJEKSI", "SALEP", "INFUS"];

const categoryConfig: Record<AntibioticCategory, { label: string; className: string }> = {
  KOMERSIAL: { label: "Komersial", className: "bg-ams-blue/10 text-ams-blue border-ams-blue/20" },
  DIAWASI: { label: "Diawasi", className: "bg-ams-orange-light text-ams-orange border-ams-orange/20" },
  RISET: { label: "Riset", className: "bg-ams-red/10 text-ams-red border-ams-red/20" },
};

const antibioticSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  description: z.string().min(5, "Deskripsi minimal 5 karakter"),
  category: z.enum(["KOMERSIAL", "DIAWASI", "RISET"] as const, "Pilih kategori"),
  form: z.enum(["TABLET", "KAPSUL", "SIRUP", "INJEKSI", "SALEP", "INFUS"] as const, "Pilih bentuk"),
  stock: z.number().min(0, "Stok tidak boleh negatif"),
});

type AntibioticFormData = z.infer<typeof antibioticSchema>;

export default function AntibioticsPage() {
  const [antibiotics, setAntibiotics] = useState<Antibiotic[]>([]);
  const [meta, setMeta] = useState<PaginatedResponse<Antibiotic>["meta"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<Antibiotic | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<AntibioticCategory[]>([]);
  const [selectedForm, setSelectedForm] = useState<AntibioticForm | "">("");
  const [page, setPage] = useState(1);

  const form = useForm<AntibioticFormData>({ resolver: zodResolver(antibioticSchema) });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchAntibiotics = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | string[]> = {
        page: String(page),
        limit: "10",
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategories.length > 0) params.category = selectedCategories;
      if (selectedForm) params.form = selectedForm;

      const res = await api.get<PaginatedResponse<Antibiotic>>("/antibiotics", params);
      setAntibiotics(res?.data ?? []);
      setMeta(res?.meta ?? null);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedCategories, selectedForm, page]);

  useEffect(() => {
    fetchAntibiotics();
  }, [fetchAntibiotics]);

  function toggleCategory(cat: AntibioticCategory) {
    setPage(1);
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function resetFilters() {
    setSearch("");
    setDebouncedSearch("");
    setSelectedCategories([]);
    setSelectedForm("");
    setPage(1);
  }

  function openAdd() {
    setEditTarget(null);
    form.reset({ name: "", description: "", stock: 0 });
    setShowDialog(true);
  }

  function openEdit(a: Antibiotic) {
    setEditTarget(a);
    form.reset({
      name: a.name,
      description: a.description,
      category: a.category,
      form: a.form,
      stock: a.stock,
    });
    setShowDialog(true);
  }

  async function onSubmit(data: AntibioticFormData) {
    setIsSubmitting(true);
    try {
      if (editTarget) {
        await api.patch<Antibiotic>(`/antibiotics/${editTarget.id}`, data);
        toast.success("Antibiotik berhasil diupdate");
      } else {
        await api.post<Antibiotic>("/antibiotics", data);
        toast.success("Antibiotik berhasil ditambahkan");
        setPage(1);
      }
      setShowDialog(false);
      fetchAntibiotics();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? "Gagal menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await api.delete(`/antibiotics/${id}`);
      toast.success("Antibiotik berhasil dihapus");
      fetchAntibiotics();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? "Gagal menghapus antibiotik");
    } finally {
      setDeletingId(null);
    }
  }

  const hasActiveFilters = search || selectedCategories.length > 0 || selectedForm;

  const pageNumbers = meta
    ? Array.from({ length: meta.totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === meta.totalPages || Math.abs(p - page) <= 1)
        .reduce<(number | "...")[]>((acc, p, i, arr) => {
          if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
          acc.push(p);
          return acc;
        }, [])
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ams-black">Antibiotik</h1>
          <p className="text-sm text-ams-black/50">Kelola daftar antibiotik yang tersedia</p>
        </div>
        <Button onClick={openAdd} className="bg-ams-red hover:bg-ams-red/90 text-white rounded-full gap-2">
          <Plus className="w-4 h-4" /> Tambah Antibiotik
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ams-black/30" />
            <Input
              placeholder="Cari nama antibiotik..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 bg-ams-white border-ams-black/10"
            />
            {search && (
              <button
                onClick={() => { setSearch(""); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ams-black/30 hover:text-ams-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Select
            value={selectedForm || "ALL"}
            onValueChange={(v) => { setSelectedForm(v === "ALL" ? "" : v as AntibioticForm); setPage(1); }}
          >
            <SelectTrigger className="w-40 bg-ams-white border-ams-black/10">
              <SelectValue placeholder="Semua Bentuk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Bentuk</SelectItem>
              {FORMS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-ams-black/40">Kategori:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                selectedCategories.includes(cat)
                  ? categoryConfig[cat].className
                  : "border-ams-black/10 text-ams-black/50 hover:border-ams-black/30 hover:text-ams-black"
              }`}
            >
              {categoryConfig[cat].label}
            </button>
          ))}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs text-ams-black/40 hover:text-ams-red transition-colors"
            >
              <X className="w-3 h-3" /> Reset filter
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-ams-white rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-5 h-5 animate-spin text-ams-red" />
          </div>
        ) : antibiotics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-ams-black/30">
            <p className="text-sm">{hasActiveFilters ? "Tidak ada hasil yang cocok" : "Belum ada antibiotik"}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ams-black/5 text-ams-black/40 text-xs">
                <th className="text-left px-6 py-4 font-medium">Nama</th>
                <th className="text-left px-6 py-4 font-medium">Kategori</th>
                <th className="text-left px-6 py-4 font-medium">Bentuk</th>
                <th className="text-left px-6 py-4 font-medium">Stok</th>
                <th className="text-right px-6 py-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {antibiotics.map((a) => (
                <tr key={a.id} className="border-b border-ams-black/5 last:border-0 hover:bg-ams-gray/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-ams-black">{a.name}</p>
                    <p className="text-xs text-ams-black/40 truncate max-w-xs">{a.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={categoryConfig[a.category].className}>
                      {categoryConfig[a.category].label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-ams-black/70">{a.form}</td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${a.stock < 10 ? "text-ams-red" : "text-ams-black"}`}>
                      {a.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(a)}
                        className="p-2 rounded-full hover:bg-ams-black/5 transition-colors text-ams-black/40 hover:text-ams-black"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        disabled={deletingId === a.id}
                        className="p-2 rounded-full hover:bg-ams-red/10 transition-colors text-ams-black/40 hover:text-ams-red"
                      >
                        {deletingId === a.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-ams-black/40">
            {meta.total} antibiotik · halaman {meta.page} dari {meta.totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-full hover:bg-ams-black/5 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span key={`e-${i}`} className="px-1 text-xs text-ams-black/30">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                    page === p ? "bg-ams-red text-white" : "hover:bg-ams-black/5 text-ams-black/60"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="p-2 rounded-full hover:bg-ams-black/5 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dialog Tambah/Edit */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Antibiotik" : "Tambah Antibiotik"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Nama</Label>
              <Input placeholder="Amoxicillin" {...form.register("name")} />
              {form.formState.errors.name && <p className="text-xs text-ams-red">{form.formState.errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Deskripsi</Label>
              <Textarea placeholder="Antibiotik spektrum luas" {...form.register("description")} rows={2} />
              {form.formState.errors.description && <p className="text-xs text-ams-red">{form.formState.errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-ams-black/70">Kategori</Label>
                <Select defaultValue={editTarget?.category} onValueChange={(v) => form.setValue("category", v as AntibioticCategory)}>
                  <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KOMERSIAL">Komersial</SelectItem>
                    <SelectItem value="DIAWASI">Diawasi</SelectItem>
                    <SelectItem value="RISET">Riset</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.category && <p className="text-xs text-ams-red">{form.formState.errors.category.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-ams-black/70">Bentuk</Label>
                <Select defaultValue={editTarget?.form} onValueChange={(v) => form.setValue("form", v as AntibioticForm)}>
                  <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>
                    {FORMS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
                {form.formState.errors.form && <p className="text-xs text-ams-red">{form.formState.errors.form.message}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-ams-black/70">Stok</Label>
              <Input type="number" min={0} placeholder="100" {...form.register("stock", { valueAsNumber: true })} />
              {form.formState.errors.stock && <p className="text-xs text-ams-red">{form.formState.errors.stock.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting} className="bg-ams-red hover:bg-ams-red/90 text-white rounded-full">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editTarget ? "Simpan Perubahan" : "Tambah Antibiotik"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
