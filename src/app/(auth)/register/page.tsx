"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["DOCTOR", "ADMIN_PPRA"], {
    required_error: "Pilih role terlebih dahulu",
  }),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterForm) {
    setIsLoading(true);
    try {
      await api.post("/auth/register", data);
      toast.success("Akun berhasil dibuat, silakan masuk");
      router.push("/login");
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ?? "Gagal membuat akun";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md px-6">
      <div className="bg-ams-white rounded-2xl shadow-sm p-8 flex flex-col gap-6">

        <div className="flex flex-col gap-1">
          <span className="text-2xl font-bold text-ams-black">Buat Akun</span>
          <p className="text-sm text-ams-black/50">
            Daftarkan diri untuk mengakses AMS
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="text-ams-black/70 text-sm">
              Nama Lengkap
            </Label>
            <Input
              id="name"
              placeholder="Dr. Budi Santoso"
              className="bg-white border-ams-black/10 focus-visible:ring-ams-red"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-ams-red">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-ams-black/70 text-sm">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@rumahsakit.com"
              className="bg-white border-ams-black/10 focus-visible:ring-ams-red"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-ams-red">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-ams-black/70 text-sm">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="bg-white border-ams-black/10 focus-visible:ring-ams-red"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-ams-red">{errors.password.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-ams-black/70 text-sm">Role</Label>
            <Select onValueChange={(val) => setValue("role", val as "DOCTOR" | "ADMIN_PPRA")}>
              <SelectTrigger className="bg-white border-ams-black/10 focus:ring-ams-red">
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DOCTOR">Dokter</SelectItem>
                <SelectItem value="ADMIN_PPRA">Admin PPRA</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-xs text-ams-red">{errors.role.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-ams-red hover:bg-ams-red/90 text-white font-semibold rounded-full mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Daftar"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-ams-black/50">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-ams-red font-medium hover:underline">
            Masuk sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
