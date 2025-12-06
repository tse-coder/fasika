import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useChildren } from "@/stores/children.store";
import type { Child } from "@/types/child.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, CreditCard, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Payment } from "@/types/payment.types";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Payments = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { children, fetchChildren } = useChildren();
  const [payments, setPayments] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterChild, setFilterChild] = useState(
    searchParams.get("child") || "all"
  );

  const [form, setForm] = useState({
    childId: searchParams.get("child") || "",
    amount: "",
    month: MONTHS[new Date().getMonth()],
    year: new Date().getFullYear().toString(),
    method: "cash" as any,
    notes: "",
  });

  useEffect(() => {
    // load children from backend
    fetchChildren();
    // payments are not implemented yet
    setPayments([]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.childId) {
      toast({
        title: "Error",
        description: "Please select a child",
        variant: "destructive",
      });
      return;
    }

    // payments are not persisted yet — feature not implemented
    toast({
      title: "Not Implemented",
      description: "Payments are not yet supported.",
    });
    setOpen(false);
    setForm({
      childId: "",
      amount: "",
      month: MONTHS[new Date().getMonth()],
      year: new Date().getFullYear().toString(),
      method: "cash",
      notes: "",
    });

    toast({
      title: "Payment Recorded",
      description: "The payment has been successfully recorded.",
    });
  };

  const getChildName = (childId: string) => {
    const child = children.find((c: any) => String(c.id) === String(childId));
    return child ? `${child.fname} ${child.lname}` : "Unknown";
  };

  const filteredPayments = payments
    .filter((p) => {
      if (filterChild !== "all" && p.childId !== filterChild) return false;
      if (search) {
        const childName = getChildName(p.childId).toLowerCase();
        return childName.includes(search.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterChild} onValueChange={setFilterChild}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by child" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Children</SelectItem>
                {children.map((child: any) => (
                  <SelectItem key={child.id} value={String(child.id)}>
                    {child.fname} {child.lname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Record New Payment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Child</Label>
                  <Select
                    value={form.childId}
                    onValueChange={(value) =>
                      setForm({ ...form, childId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a child" />
                    </SelectTrigger>
                    <SelectContent>
                      {children
                        .filter((c: any) => c.is_active)
                        .map((child: any) => (
                          <SelectItem key={child.id} value={String(child.id)}>
                            {child.fname} {child.lname}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Month</Label>
                    <Select
                      value={form.month}
                      onValueChange={(value) =>
                        setForm({ ...form, month: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                      type="number"
                      value={form.year}
                      onChange={(e) =>
                        setForm({ ...form, year: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Amount (ETB)</Label>
                  <Input
                    type="number"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={form.method}
                    onValueChange={(value: Payment["method"]) =>
                      setForm({ ...form, method: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    placeholder="Add any additional notes..."
                    rows={2}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Record Payment
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Payments Table */}
        <div className="stat-card overflow-hidden">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-16">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No payments found</h3>
              <p className="text-muted-foreground">
                {payments.length === 0
                  ? "Start by recording your first payment"
                  : "No matches for your filters"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold text-foreground">
                      Child
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-foreground">
                      Period
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-foreground">
                      Amount
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-foreground">
                      Method
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary text-sm font-medium">
                              {getChildName(payment.childId)
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <span className="font-medium">
                            {getChildName(payment.childId)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {payment.month} {payment.year}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-foreground">
                          ETB {payment.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="capitalize">
                          {payment.method.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
