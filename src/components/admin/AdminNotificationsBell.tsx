import { useEffect, useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import {
  listNotifications,
  countUnread,
  markAllRead,
  markRead,
  deleteNotification,
  type AdminNotification,
} from "@/lib/security/notifications";
import { supabase } from "@/integrations/supabase/client";

const sevColor: Record<string, string> = {
  info: "secondary",
  low: "outline",
  medium: "default",
  high: "destructive",
  critical: "destructive",
};

export default function AdminNotificationsBell() {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const refresh = async () => {
    try {
      const [list, n] = await Promise.all([listNotifications(20), countUnread()]);
      setItems(list);
      setUnread(n);
    } catch {
      /* ignore — not admin */
    }
  };

  useEffect(() => {
    refresh();
    const channel = supabase
      .channel("admin_notifications_bell")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_notifications" },
        () => refresh()
      )
      .subscribe();
    const t = setInterval(refresh, 60_000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(t);
    };
  }, []);

  const handleClick = async (n: AdminNotification) => {
    if (!n.read_at) await markRead(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
    refresh();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-[10px]"
            >
              {unread > 99 ? "99+" : unread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="font-semibold text-sm">
            Admin Notifications {unread > 0 && <span className="text-muted-foreground">({unread})</span>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await markAllRead();
              refresh();
            }}
            disabled={unread === 0}
          >
            <Check className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        </div>
        <ScrollArea className="max-h-96">
          {items.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            <div className="divide-y">
              {items.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 hover:bg-muted/50 ${!n.read_at ? "bg-muted/30" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => handleClick(n)}
                      className="flex-1 text-left space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant={sevColor[n.severity] as any}>{n.severity}</Badge>
                        <span className="font-medium text-sm">{n.title}</span>
                      </div>
                      {n.message && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={async () => {
                        await deleteNotification(n.id);
                        refresh();
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
