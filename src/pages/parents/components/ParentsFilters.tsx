import { Button } from "@/components/ui/button";

interface ParentsFiltersProps {
  activeFilter: string;
  onActiveFilterChange: (filter: string) => void;
  onClearFilters: () => void;
}

export const ParentsFilters = ({
  activeFilter,
  onActiveFilterChange,
  onClearFilters,
}: ParentsFiltersProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={activeFilter === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onActiveFilterChange("all")}
      >
        All
      </Button>
      <Button
        variant={activeFilter === "active" ? "default" : "outline"}
        size="sm"
        onClick={() => onActiveFilterChange("active")}
      >
        Active
      </Button>
      <Button
        variant={activeFilter === "inactive" ? "default" : "outline"}
        size="sm"
        onClick={() => onActiveFilterChange("inactive")}
      >
        Inactive
      </Button>
      {activeFilter !== "all" && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Clear
        </Button>
      )}
    </div>
  );
};
