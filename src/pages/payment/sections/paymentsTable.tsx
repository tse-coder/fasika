import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";
import React from "react";
import type { Payment } from "@/types/payment.types";
import type { Child } from "@/types/child.types";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PaymentsTableProps = {
  payments: Payment[];
  children: Child[];
  getChildName: (childId: number) => string;
  filteredPayments: Payment[];
  onPaymentClick: (payment: Payment) => void;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  currentPage: number;
};

function PaymentsTable({
  payments,
  children,
  getChildName,
  filteredPayments,
  onPaymentClick,
  pagination,
  onPageChange,
  currentPage,
}: PaymentsTableProps) {
  const formatMonth = (monthString: string) => {
    const date = new Date(monthString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  // Get first month for display (one line)
  const getFirstMonth = (payment: Payment) => {
    if (payment.monthly_records.length === 0) return "-";
    const firstMonth = payment.monthly_records[0];
    const monthCount = payment.monthly_records.length;
    if (monthCount === 1) {
      return formatMonth(firstMonth.month);
    }
    return `${formatMonth(firstMonth.month)} (+${monthCount - 1})`;
  };

  return (
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
                  Total Amount
                </th>
                <th className="text-left py-4 px-4 font-semibold text-foreground">
                  Method
                </th>
                <th className="text-left py-4 px-4 font-semibold text-foreground">
                  Payment Date
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr
                  key={payment.id}
                  onClick={() => onPaymentClick(payment)}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary text-sm font-medium">
                          {getChildName(payment.child_id)
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <span className="font-medium truncate">
                        {getChildName(payment.child_id)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">
                    <span className="truncate block">
                      {getFirstMonth(payment)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-foreground truncate block">
                      ETB {parseFloat(payment.total_amount).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="outline" className="capitalize truncate">
                      {payment.method}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">
                    <span className="truncate block">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 border-t pt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    currentPage > 1 && onPageChange(currentPage - 1)
                  }
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((pageNum) => {
                // Show first page, last page, current page, and pages around current
                if (
                  pageNum === 1 ||
                  pageNum === pagination.totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => onPageChange(pageNum)}
                        isActive={pageNum === currentPage}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    currentPage < pagination.totalPages &&
                    onPageChange(currentPage + 1)
                  }
                  className={
                    currentPage === pagination.totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

export default PaymentsTable;
