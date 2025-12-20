import { AlertCircle } from "lucide-react";
import { LoaderIcon } from "@/components/ui/skeleton-card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { LatePaymentRow } from "./LatePaymentRow";
import type { LatePaymentChild } from "../hooks/useLatePayments";

interface LatePaymentsTableProps {
  latePayments: LatePaymentChild[];
  isLoading: boolean;
  page: number;
  limit: number;
  sendingEmails: Set<number>;
  onPageChange: (page: number) => void;
  onSendNotification: (child: LatePaymentChild) => void;
}

/**
 * Component to display the late payments table with pagination
 */
export const LatePaymentsTable = ({
  latePayments,
  isLoading,
  page,
  limit,
  sendingEmails,
  onPageChange,
  onSendNotification,
}: LatePaymentsTableProps) => {
  // Calculate pagination
  const totalPages = Math.ceil(latePayments.length / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = latePayments.slice(start, end);

  // Loading state
  if (isLoading) {
    return (
      <div className="stat-card overflow-hidden">
        <div className="flex items-center justify-center py-16">
          <LoaderIcon className="w-6 h-6" />
        </div>
      </div>
    );
  }

  // Empty state
  if (paginatedData.length === 0) {
    return (
      <div className="stat-card overflow-hidden">
        <div className="text-center py-16">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2">No Late Payments</h3>
          <p className="text-muted-foreground">
            {latePayments.length === 0
              ? "All payments are up to date"
              : "No payments match the selected filter"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="stat-card overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-4 font-semibold text-foreground">
                Child
              </th>
              <th className="text-left py-4 px-4 font-semibold text-foreground">
                Age
              </th>
              <th className="text-left py-4 px-4 font-semibold text-foreground">
                Months Late
              </th>
              <th className="text-left py-4 px-4 font-semibold text-foreground">
                Unpaid Months
              </th>
              <th className="text-left py-4 px-4 font-semibold text-foreground">
                Monthly Fee
              </th>
              <th className="text-left py-4 px-4 font-semibold text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((child) => (
              <LatePaymentRow
                key={child.id}
                child={child}
                isSendingEmail={sendingEmails.has(child.id)}
                onSendNotification={onSendNotification}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 border-t pt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 && onPageChange(page - 1)}
                  className={
                    page === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => {
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => onPageChange(pageNum)}
                          isActive={pageNum === page}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (pageNum === page - 2 || pageNum === page + 2) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                }
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => page < totalPages && onPageChange(page + 1)}
                  className={
                    page === totalPages
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
};
