import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LateRange } from "../hooks/useLatePayments";

interface LatePaymentsFiltersProps {
  lateRange: LateRange;
  onRangeChange: (range: LateRange) => void;
}

/**
 * Component for filtering late payments by months late
 * Filters payments from January to now based on how many months late they are
 */
export const LatePaymentsFilters = ({
  lateRange,
  onRangeChange,
}: LatePaymentsFiltersProps) => {
  return (
    <Select
      value={lateRange}
      onValueChange={(v) => onRangeChange(v as LateRange)}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Filter by late range" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">1 Month Late</SelectItem>
        <SelectItem value="2">2 Months Late</SelectItem>
        <SelectItem value="3">3 Months Late</SelectItem>
        <SelectItem value="3+">More than 3 Months</SelectItem>
      </SelectContent>
    </Select>
  );
};
