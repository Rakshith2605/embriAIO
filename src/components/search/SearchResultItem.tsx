import { SearchableItem } from "@/types/curriculum";
import { BookOpen, FileCode2, Star, Dumbbell, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcons = {
  chapter: BookOpen,
  main: FileCode2,
  supplemental: FileCode2,
  exercise: Dumbbell,
  bonus: Star,
};

const typeLabels = {
  chapter: "Overview",
  main: "Notebook",
  supplemental: "Notebook",
  exercise: "Exercises",
  bonus: "Bonus",
};

interface Props {
  item: SearchableItem;
  isActive: boolean;
  onClick: () => void;
}

export function SearchResultItem({ item, isActive, onClick }: Props) {
  const Icon = typeIcons[item.type] ?? FileCode2;
  const label = typeLabels[item.type] ?? "Notebook";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
        isActive ? "bg-primary/10 text-primary" : "hover:bg-accent text-foreground"
      )}
    >
      <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium truncate">{item.notebookTitle}</span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
            {label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.chapterTitle}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-1">{item.description}</p>
        )}
      </div>
      {item.isBonus && <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />}
    </button>
  );
}
