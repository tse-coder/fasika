import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useLatePayments, type LateRange } from "./hooks/useLatePayments";
import { useNotificationHandler } from "./hooks/useNotificationHandler";
import { LatePaymentsHeader } from "./components/LatePaymentsHeader";
import { LatePaymentsTable } from "./components/LatePaymentsTable";

/**
 * Main component for the Late Payments page
 * Shows children with overdue payments from January of current year to now
 */
const LatePayments = () => {
  const [lateRange, setLateRange] = useState<LateRange>("1");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Fetch late payments data
  const { latePayments, isLoading } = useLatePayments(lateRange);

  // Handle notification sending
  const { sendingEmails, sendNotification } = useNotificationHandler();

  // Handle range change and reset page
  const handleRangeChange = (range: LateRange) => {
    setLateRange(range);
    setPage(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <LatePaymentsHeader
          lateRange={lateRange}
          onRangeChange={handleRangeChange}
        />
        <LatePaymentsTable
          latePayments={latePayments}
          isLoading={isLoading}
          page={page}
          limit={limit}
          sendingEmails={sendingEmails}
          onPageChange={setPage}
          onSendNotification={sendNotification}
        />
      </div>
    </DashboardLayout>
  );
};

export default LatePayments;
