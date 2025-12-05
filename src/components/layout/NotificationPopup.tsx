import { useState } from "react";
import { Bell, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Seed data with varied types
const initialNotifications = [
    {
        id: "1",
        title: "Đăng ký mới",
        message: "Nguyễn Văn A vừa đăng ký nhận hỗ trợ laptop",
        time: "5 phút trước",
        read: false,
        type: "info" as const,
    },
    {
        id: "2",
        title: "Quyên góp thành công",
        message: "Trần Thị B đã xác nhận trao tặng MacBook Pro 2015",
        time: "1 giờ trước",
        read: false,
        type: "success" as const,
    },
    {
        id: "3",
        title: "Cảnh báo tốn kho",
        message: "Số lượng RAM 8GB sắp hết (còn 2 chiếc)",
        time: "2 giờ trước",
        read: true,
        type: "warning" as const,
    },
    {
        id: "4",
        title: "Yêu cầu bị từ chối",
        message: "Hệ thống tự động từ chối yêu cầu #123 do thiếu thông tin chi tiết",
        time: "1 ngày trước",
        read: true,
        type: "error" as const,
    },
    {
        id: "5",
        title: "Hệ thống bảo trì",
        message: "Hệ thống sẽ bảo trì vào 12:00 đêm nay để nâng cấp tính năng mới",
        time: "2 ngày trước",
        read: true,
        type: "info" as const,
    },
];

export function NotificationPopup() {
    const [notifications, setNotifications] = useState(initialNotifications);
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const getIcon = (type: typeof initialNotifications[0]['type']) => {
        switch (type) {
            case 'info': return <Info className="h-3.5 w-3.5" />;
            case 'success': return <CheckCircle className="h-3.5 w-3.5" />;
            case 'warning': return <AlertTriangle className="h-3.5 w-3.5" />;
            case 'error': return <XCircle className="h-3.5 w-3.5" />;
        }
    };

    const getStyle = (type: typeof initialNotifications[0]['type']) => {
        switch (type) {
            case 'info': return "bg-blue-100/50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";
            case 'success': return "bg-green-100/50 text-green-600 dark:bg-green-900/20 dark:text-green-400";
            case 'warning': return "bg-yellow-100/50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400";
            case 'error': return "bg-red-100/50 text-red-600 dark:bg-red-900/20 dark:text-red-400";
        }
    };

    return (
        <Popover open= { isOpen } onOpenChange = { setIsOpen } >
            <PopoverTrigger asChild >
            <Button variant="ghost" size = "icon" className = "relative hover:bg-muted/50 transition-colors" >
                <Bell className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
                    { unreadCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-in zoom-in duration-300" >
                            { unreadCount }
                            </span>
          )
}
</Button>
    </PopoverTrigger>
    < PopoverContent className = "w-80 p-0 shadow-lg border-border/50" align = "end" sideOffset = { 8} >
        <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/10" >
            <h4 className="font-semibold text-sm" > Thông báo </h4>
{
    unreadCount > 0 && (
        <Button
              variant="ghost"
    size = "sm"
    className = "h-auto px-2 text-xs text-muted-foreground hover:text-primary transition-colors hover:bg-transparent"
    onClick = { markAllAsRead }
        >
        Đánh dấu đã đọc
            </Button>
          )
}
</div>
    < ScrollArea className = "h-[350px]" >
        {
            notifications.length === 0 ? (
                <div className= "flex flex-col items-center justify-center py-12 text-center text-muted-foreground" >
                <Bell className="mb-3 h-10 w-10 opacity-20" />
                    < p className="text-sm" > Không có thông báo mới</ p >
        </div>
          ) : (
    <div className= "divide-y divide-border/50" >
    {
        notifications.map((notification) => (
            <div
                  key= { notification.id }
                  className = {
                cn(
                    "relative flex items-start gap-3 p-4 transition-all duration-200 hover:bg-muted/40 cursor-pointer group",
                    !notification.read ? "bg-muted/10" : "bg-card"
                  )
    }
onClick = {() => markAsRead(notification.id)}
                >
    <div className={ cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm", getStyle(notification.type)) }>
        { getIcon(notification.type) }
        </div>
        < div className = "flex-1 min-w-0 space-y-1" >
            <p className={ cn("text-sm leading-none transition-all", !notification.read ? "font-semibold text-foreground" : "font-medium text-muted-foreground") }>
                { notification.title }
                </p>
                < p className = "text-xs text-muted-foreground line-clamp-2 leading-relaxed" >
                    { notification.message }
                    </p>
                    < p className = "text-[10px] font-medium text-muted-foreground/60 pt-1" >
                        { notification.time }
                        </p>
                        </div>
{
    !notification.read && (
        <span className="absolute top-1/2 right-3 -translate-y-1/2 h-2 w-2 rounded-full bg-primary shadow-sm ring-2 ring-background transition-opacity group-hover:opacity-0" />
                  )
}
</div>
              ))}
</div>
          )}
</ScrollArea>
    < div className = "border-t p-2" >
        <Button variant="ghost" size = "sm" className = "w-full text-xs text-muted-foreground h-8" >
            Xem tất cả
                </Button>
                </div>
                </PopoverContent>
                </Popover>
  );
}
