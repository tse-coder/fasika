import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChildrenFiltersProps {
  activeFilter: string;
  onActiveFilterChange: (value: string) => void;
  minAge: string;
  maxAge: string;
  onMinAgeChange: (value: string) => void;
  onMaxAgeChange: (value: string) => void;
  onClearFilters: () => void;
}

/**
 * Component for filtering children by status and age range
 */
export const ChildrenFilters = ({
  activeFilter,
  onActiveFilterChange,
  minAge,
  maxAge,
  onMinAgeChange,
  onMaxAgeChange,
  onClearFilters,
}: ChildrenFiltersProps) => {
  const hasActiveFilters = minAge || maxAge || activeFilter !== "all";

  return (
    <div className="flex flex-wrap gap-4">
      <Select value={activeFilter} onValueChange={onActiveFilterChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="Min Age"
          value={minAge}
          onChange={(e) => onMinAgeChange(e.target.value)}
          className="w-[100px]"
          min="0"
        />
        <span className="text-muted-foreground">-</span>
        <Input
          type="number"
          placeholder="Max Age"
          value={maxAge}
          onChange={(e) => onMaxAgeChange(e.target.value)}
          className="w-[100px]"
          min="0"
        />
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
};
