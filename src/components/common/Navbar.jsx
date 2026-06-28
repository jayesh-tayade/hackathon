import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ROUTE_LABELS } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar({ onOpenMobileSidebar }) {
  const { user } = useAuth();
  const location = useLocation();
  const pageTitle = ROUTE_LABELS[location.pathname] || "Chronos";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          onClick={onOpenMobileSidebar}
          aria-label="Open sidebar"
        >
          <Menu />
        </Button>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{pageTitle}</h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Stay focused and productive
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user?.photoURL && (
          <img
            src={user.photoURL}
            alt={user.displayName || "User avatar"}
            className="size-9 rounded-full ring-2 ring-border"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-none">
            {user?.displayName || "User"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{user?.email}</p>
        </div>
      </div>
    </header>
  );
}
