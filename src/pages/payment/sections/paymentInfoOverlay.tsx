import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Payment } from "@/types/payment.types";
import { Child } from "@/types/child.types";
import {
  Calendar,
  CreditCard,
  DollarSign,
  Trash2,
  FileText,
} from "lucide-react";
import { formatDate } from "date-fns";

type PaymentInfoOverlayProps = {
  payment: Payment;
  child: Child | null;
  onDelete: (id: number) => Promise<void>;
  isDeleting?: boolean;
};

export function PaymentInfoOverlay({
  payment,
  child,
  onDelete,
  isDeleting = false,
}: PaymentInfoOverlayProps) {
  const formatMonth = (monthString: string) => {
    const date = new Date(monthString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const handleDelete = async () => {
    try {
      await onDelete(payment.id);
    } catch (err) {
      // Error handling is done in parent
    }
  };

  return (
    <div className="space-y-6 overflow-y-auto max-h-[80vh] scrollbar-none">
      {/* Payment Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-7 h-7 text-primary" />
          </div>
          <div>
            <DialogTitle className="text-2xl font-bold leading-tight">
              Payment #{payment.id}
            </DialogTitle>
            {child && (
              <p className="text-muted-foreground mt-1">
                {child.fname} {child.lname}
              </p>
            )}
          </div>
        </div>

        {/* Delete Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Payment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this payment? This action cannot
                be undone. All associated monthly records will also be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Payment Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="font-semibold text-lg">
              ETB {parseFloat(payment.total_amount).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Payment Method</p>
            <Badge variant="outline" className="mt-1">
              {payment.method}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Payment Date</p>
            <p className="font-medium">
              {formatDate(payment.payment_date, "PPP")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="font-medium">
              {formatDate(payment.created_at, "PPP")}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Records */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Monthly Records ({payment.monthly_records.length})
        </h3>

        {payment.monthly_records.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
            No monthly records found
          </p>
        ) : (
          <div className="space-y-2">
            {payment.monthly_records.map((record) => (
              <div
                key={record.id}
                className="p-4 rounded-lg border bg-card shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{formatMonth(record.month)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Record ID: {record.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ETB {parseFloat(record.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(record.created_at, "PP")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      {payment.notes && (
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Notes</h3>
          <div className="p-4 bg-muted/30 rounded-lg border">
            <p className="text-sm">{payment.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
