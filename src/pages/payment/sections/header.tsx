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
import { mockExportPayments } from "@/mock/api";
import { StudentSearch } from "./studentSearch";
import { PaymentForm } from "./paymentForm";
import type { Child } from "@/types/child.types";

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
  startMonth: string | null;
  endMonth: string | null;
  setStartMonth: (v: string | null) => void;
  setEndMonth: (v: string | null) => void;
  userRole?: "ADMIN" | "USER";
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
  startMonth,
  endMonth,
  setStartMonth,
  setEndMonth,
  userRole,
}: PaymentHeaderProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true);
      const params: Record<string, any> = {};
      if (startMonth) params.startDate = `${startMonth}-01`;
      if (endMonth) {
        const [y, m] = endMonth.split("-").map(Number);
        const lastDay = new Date(y, m, 0).getDate();
        params.endDate = `${endMonth}-${String(lastDay).padStart(2, "0")}`;
      }
      if (selectedMethod && selectedMethod !== "all") params.method = selectedMethod;

      const res = await mockExportPayments(params);
      // download as Excel-compatible file (CSV content with .xls extension)
      const fname = res.filename.replace(/\.csv$/i, ".xls");
      const blob = new Blob([res.csv], { type: "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fname;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  }, [startMonth, endMonth, selectedMethod]);

  return (
    <div className="space-y-4">
      {/* Student Search and Payment Button */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {userRole === "ADMIN" && (<div className="flex-1">
          <StudentSearch
            selectedChildren={selectedChildren}
            onSelect={onSelectChild}
            onRemove={onRemoveChild}
          />
        </div>)}
        

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
                    type="month"
                    value={startMonth ?? ""}
                    onChange={(e) => setStartMonth(e.target.value || null)}
                    className="pl-10 w-[140px]"
                    aria-label="Start month"
                  />
                </div>
                <span className="text-sm text-muted-foreground">to</span>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="month"
                    value={endMonth ?? ""}
                    onChange={(e) => setEndMonth(e.target.value || null)}
                    className="pl-10 w-[140px]"
                    aria-label="End month"
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
