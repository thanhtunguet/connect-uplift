import { Bell, Search, LogOut } from "lucide-react";
import { NotificationPopup } from "./NotificationPopup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Đã đăng xuất",
      description: "Hẹn gặp lại bạn!",
    });
    navigate("/auth");
  };

  const getInitials = (name: string | undefined | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email;

  return (
    <header className= "sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60" >
    <div className="flex items-center gap-4" >
      <SidebarTrigger />
      < div >
      <h1 className="text-xl font-semibold text-foreground" > { title } </h1>
  {
    description && (
      <p className="text-sm text-muted-foreground" > { description } </p>
          )
  }
  </div>
    </div>

    < div className = "flex items-center gap-4" >
      <div className="relative hidden md:block" >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm..."
  className = "w-64 pl-9"
    />
    </div>

    < NotificationPopup />

    <DropdownMenu>
    <DropdownMenuTrigger asChild >
    <Button variant="ghost" className = "relative h-9 w-9 rounded-full" >
      <Avatar className="h-9 w-9" >
        <AvatarImage src={ user?.user_metadata?.avatar_url } />
          < AvatarFallback className = "bg-primary text-primary-foreground" >
            { getInitials(fullName) }
            </AvatarFallback>
            </Avatar>
            </Button>
            </DropdownMenuTrigger>
            < DropdownMenuContent className = "w-56" align = "end" forceMount >
              <DropdownMenuLabel className="font-normal" >
                <div className="flex flex-col space-y-1" >
                  <p className="text-sm font-medium leading-none" > { fullName || "Người dùng"
} </p>
  < p className = "text-xs leading-none text-muted-foreground" >
    { user?.email }
    </p>
    </div>
    </DropdownMenuLabel>
    < DropdownMenuSeparator />
    <DropdownMenuItem onClick={ () => navigate("/cai-dat") }>
      Cài đặt
        </DropdownMenuItem>
        < DropdownMenuSeparator />
        <DropdownMenuItem onClick={ handleSignOut } className = "text-destructive" >
          <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
              </DropdownMenuItem>
              </DropdownMenuContent>
              </DropdownMenu>
              </div>
              </header>
  );
}
