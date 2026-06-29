import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <Button
      variant="outline"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="gap-2"
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4" />
          Light Mode
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          Dark Mode
        </>
      )}
    </Button>
  );
}