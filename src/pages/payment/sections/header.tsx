import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, File, Calendar } from "lucide-react";
import { useCallback, useState } from "react";
import { StudentSearch } from "./studentSearch";
import { PaymentForm } from "./paymentForm";
import type { Child } from "@/types/child.types";
import { getChildName } from "../utils/paymentFilters";

const PAYMENT_METHODS = ["Cash", "CBE", "Dashen Bank"];

type PaymentHeaderProps = {
  search: string;
  setSearch: (value: string) => void;
  selectedChildren: Child[];
  onSelectChild: (child: Child) => void;
  onRemoveChild: (childId: number) => void;
  selectedMethod: string;
  setSelectedMethod: (value: string) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
  onSubmitPayment: (data: {
    child_id: number;
    total_amount: number;
    months: string[];
    method: string;
    notes?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
  startDate: string | null;
  endDate: string | null;
  setStartDate: (v: string | null) => void;
  setEndDate: (v: string | null) => void;
  userRole?: "ADMIN" | "USER";
  filteredPayments?: any[];
  children?: Child[];
};

function PaymentHeader({
  search,
  setSearch,
  selectedChildren,
  onSelectChild,
  onRemoveChild,
  selectedMethod,
  setSelectedMethod,
  open,
  setOpen,
  onSubmitPayment,
  isSubmitting,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  userRole,
  filteredPayments = [],
  children = [],
}: PaymentHeaderProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true);

      // Use the current filtered payments instead of making an API call
      const data = filteredPayments;

      // Build CSV
      const headers = [
        "id",
        "child_id",
        "child_name",
        "total_amount",
        "payment_date",
        "method",
        "notes",
        "category",
        "branch",
        "program",
      ];

      const rows = data.map((p) => [
        p.id,
        p.child_id,
        getChildName(p.child_id, children),
        p.total_amount,
        p.payment_date,
        p.method,
        (p.notes || "")?.replace(/"/g, '""'),
        p.category || "",
        p.branch || "",
        p.program || "",
      ]);

      const csv = [
        headers.join(","),
        ...rows.map((r) =>
          r
            .map((c) =>
              typeof c === "string" && c.includes(",") ? `"${c}"` : `${c}`
            )
            .join(",")
        ),
      ].join("\n");

      // Download as Excel-compatible file (CSV content with .xls extension)
      const filename = `payments_export_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      const blob = new Blob([csv], { type: "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename.replace(/\.csv$/i, ".xls");
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  }, [filteredPayments, children]);

  return (
    <div className="space-y-4">
      {/* Student Search and Payment Button */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {userRole === "ADMIN" && (
          <div className="flex-1">
            <StudentSearch
              selectedChildren={selectedChildren}
              onSelect={onSelectChild}
              onRemove={onRemoveChild}
            />
          </div>
        )}

        <div className="flex gap-2">
          {userRole === "ADMIN" && (
            <>
              {/* Payment Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full sm:w-[200px]"
                />
              </div>

              {/* Payment Method Filter */}
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Range Selector */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={startDate ?? ""}
                    onChange={(e) => setStartDate(e.target.value || null)}
                    className="pl-10 w-[140px]"
                    aria-label="Start date"
                  />
                </div>
                <span className="text-sm text-muted-foreground">to</span>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={endDate ?? ""}
                    onChange={(e) => setEndDate(e.target.value || null)}
                    className="pl-10 w-[140px]"
                    aria-label="End date"
                  />
                </div>
              </div>

              {/* export button uses selected filters including date range */}
              <Button
                variant="secondary"
                onClick={handleExport}
                disabled={isExporting}
                title="Export payments CSV"
              >
                <File className="w-4 h-4 mr-2" />
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </>
          )}

          {/* Record Payment Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Record New Payment</DialogTitle>
              </DialogHeader>
              <PaymentForm
                onSubmit={onSubmitPayment}
                onCancel={() => setOpen(false)}
                isLoading={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

export default PaymentHeader;
