import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  showExpiring: boolean;
  onShowExpiringChange: (show: boolean) => void;
}

/**
 * Component for filtering late payments by months late
 * Filters payments from September to June based on how many months late they are
 */
export const LatePaymentsFilters = ({
  lateRange,
  onRangeChange,
  showExpiring,
  onShowExpiringChange,
}: LatePaymentsFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="expiring"
          checked={showExpiring}
          onCheckedChange={(checked) => onShowExpiringChange(checked as boolean)}
        />
        <Label htmlFor="expiring" className="text-sm font-medium">
          Show payments expiring in 10 days
        </Label>
      </div>

      <Select
        value={lateRange}
        onValueChange={(v) => onRangeChange(v as LateRange)}
        disabled={showExpiring}
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
    </div>
  );
};
