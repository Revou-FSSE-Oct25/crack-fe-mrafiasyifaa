"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { NotificationPopover } from "@/components/notification-popover";
import { cn } from "@/lib/utils";

const doctorLinks = [
  { href: "/doctor/dashboard", label: "Dashboard" },
  { href: "/doctor/patients", label: "Pasien" },
  { href: "/doctor/requests", label: "Permintaan" },
];

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/requests", label: "Permintaan" },
  { href: "/admin/antibiotics", label: "Antibiotik" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const links = user?.role === "ADMIN_PPRA" ? adminLinks : doctorLinks;

  function handleLogout() {
    clearAuth();
    toast.success("Berhasil keluar");
    router.push("/login");
  }

  return (
    <nav className="bg-ams-white border-b border-ams-black/10 px-8 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-lg font-bold tracking-tight text-ams-black">
          AMS
        </Link>
        <div className="flex items-center gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-ams-red text-white"
                  : "text-ams-black/60 hover:text-ams-black hover:bg-ams-black/5"
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationPopover />

        <div className="flex items-center gap-2 pl-3 border-l border-ams-black/10">
          <span className="text-sm font-medium text-ams-black">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-ams-black/5 transition-colors text-ams-black/60 hover:text-ams-red"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
