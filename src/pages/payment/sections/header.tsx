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
import { Plus, Search, Filter } from "lucide-react";
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
}: PaymentHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Student Search and Payment Button */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 max-w-md">
          <StudentSearch
            selectedChildren={selectedChildren}
            onSelect={onSelectChild}
            onRemove={onRemoveChild}
          />
        </div>

        <div className="flex gap-2">
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
