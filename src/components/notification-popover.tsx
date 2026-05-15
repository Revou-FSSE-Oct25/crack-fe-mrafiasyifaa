"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Inbox } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import { Notification } from "@/types";
import { cn } from "@/lib/utils";

const typeLabel: Record<Notification["type"], string> = {
  REQUEST_BARU: "Request Baru",
  REQUEST_DISETUJUI: "Request Disetujui",
  REQUEST_DITOLAK: "Request Ditolak",
  ANTIBIOTIC_KADALUARSA: "Antibiotik Kadaluarsa",
};

export function NotificationPopover() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { notifications, unreadCount, setNotifications, markOneRead, markAllRead } =
    useNotificationStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const data = await api.get<Notification[]>("/notifications");
        setNotifications(data);
      } catch {}
    }
    if (user) fetchNotifications();
  }, [user, setNotifications]);

  async function handleClick(notif: Notification) {
    try {
      if (!notif.isRead) {
        await api.patch(`/notifications/${notif.id}/read`);
        markOneRead(notif.id);
      }
    } catch {}

    setOpen(false);
    const base = user?.role === "ADMIN_PPRA" ? "/admin" : "/doctor";
    if (notif.type === "ANTIBIOTIC_KADALUARSA") {
      router.push(`${base}/antibiotics`);
    } else {
      router.push(`${base}/requests/${notif.referenceId}`);
    }
  }

  async function handleMarkAllRead() {
    try {
      await api.patch("/notifications/read-all");
      markAllRead();
    } catch {}
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="relative p-2 rounded-full hover:bg-ams-black/5 transition-colors">
        <Bell className="w-5 h-5 text-ams-black/60" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-ams-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0 rounded-2xl shadow-lg border-ams-black/10">
        <div className="flex items-center justify-between px-4 py-3 border-b border-ams-black/10">
          <span className="text-sm font-semibold text-ams-black">Notifikasi</span>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-ams-red hover:underline font-medium"
            >
              Tandai semua dibaca
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-ams-black/30">
              <Inbox className="w-8 h-8" />
              <p className="text-xs">Tidak ada notifikasi</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={cn(
                  "w-full text-left px-4 py-3 flex flex-col gap-1 hover:bg-ams-black/5 transition-colors border-b border-ams-black/5 last:border-0",
                  !notif.isRead && "bg-ams-red/5"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ams-red">
                    {typeLabel[notif.type]}
                  </span>
                  {!notif.isRead && (
                    <span className="w-2 h-2 bg-ams-red rounded-full" />
                  )}
                </div>
                <p className="text-sm text-ams-black font-medium">{notif.title}</p>
                <p className="text-xs text-ams-black/50 line-clamp-2">{notif.message}</p>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
