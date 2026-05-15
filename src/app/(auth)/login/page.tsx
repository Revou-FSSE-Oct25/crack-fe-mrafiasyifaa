"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { AuthResponse } from "@/types";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginForm = z.infer<typeof loginSchema>;
type ModalState = { open: false } | { open: true; message: string };

export default function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>({ open: false });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setIsLoading(true);
    try {
      const res = await api.post<AuthResponse>("/auth/login", data);
      setAuth(res.user, res.token);
      const destination = res.user.role === "ADMIN_PPRA" ? "/admin/dashboard" : "/doctor/dashboard";
      window.location.href = destination;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? "Email atau password salah";
      setModal({ open: true, message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="w-full max-w-md px-6">
        <div className="bg-ams-white rounded-2xl shadow-sm p-8 flex flex-col gap-6">

          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold text-ams-black">Masuk ke AMS</span>
            <p className="text-sm text-ams-black/50">
              Masukkan email dan password untuk melanjutkan
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-ams-red hover:bg-ams-red/90 text-white font-semibold rounded-full mt-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Masuk"}
            </Button>
          </form>

          <p className="text-center text-sm text-ams-black/50">
            Belum punya akun?{" "}
            <Link href="/register" className="text-ams-red font-medium hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>

      <Dialog open={modal.open} onOpenChange={() => {}}>
        <DialogContent
          className="rounded-2xl max-w-sm text-center flex flex-col items-center gap-6 py-10"
          showCloseButton={false}
        >
          {modal.open && (
            <>
              <XCircle className="w-20 h-20 text-ams-red" strokeWidth={1.5} />
              <div className="flex flex-col gap-1">
                <p className="text-xl font-bold text-ams-black">Login Gagal</p>
                <p className="text-sm text-ams-black/50">{modal.message}</p>
              </div>
              <Button
                onClick={() => setModal({ open: false })}
                className="w-full bg-ams-red hover:bg-ams-red/90 text-white rounded-full font-semibold"
              >
                Ok
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
