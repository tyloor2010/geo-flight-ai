import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ compact }: { compact?: boolean }) {
  const mode = useTheme((s) => s.mode);
  const toggle = useTheme((s) => s.toggle);
  const dark = mode === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      title={dark ? "Switch to Light — Standard Mode" : "Switch to Dark — Command Mode"}
      className={cn(
        "group flex items-center gap-2 rounded-sm border border-border bg-background/60 px-2 py-1.5 transition-colors hover:border-primary/60",
        compact && "px-1.5",
      )}
    >
      {dark ? (
        <Moon className="h-3.5 w-3.5 text-primary" />
      ) : (
        <Sun className="h-3.5 w-3.5 text-warning" />
      )}
      {!compact && (
        <span className="tac-header text-[9px] text-foreground/80">
          {dark ? "Dark — Command" : "Light — Standard"}
        </span>
      )}
    </button>
  );
}
