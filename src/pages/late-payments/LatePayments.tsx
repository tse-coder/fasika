import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useLatePayments, type LateRange } from "./hooks/useLatePayments";
import { useNotificationHandler } from "./hooks/useNotificationHandler";
import { LatePaymentsHeader } from "./components/LatePaymentsHeader";
import { LatePaymentsTable } from "./components/LatePaymentsTable";
import { exportPayments } from "@/mock/api";

/**
 * Main component for the Late Payments page
 * Shows children with overdue payments from September to June
 */
const LatePayments = () => {
  const [lateRange, setLateRange] = useState<LateRange>("1");
  const [showExpiring, setShowExpiring] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch late payments data
  const { latePayments, isLoading } = useLatePayments(lateRange, showExpiring);

  // Handle notification sending
  const { sendingEmails, sendNotification } = useNotificationHandler();

  // Handle range change and reset page
  const handleRangeChange = (range: LateRange) => {
    setLateRange(range);
    setPage(1);
  };

  // Handle show expiring change
  const handleShowExpiringChange = (show: boolean) => {
    setShowExpiring(show);
    setPage(1);
  };

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Get child IDs from late payments
      const childIds = latePayments.map(lp => lp.id);
      
      // Export payments for these children
      const { csv, filename } = await exportPayments({ 
        child_id: childIds.length === 1 ? childIds[0] : undefined 
      });
      
      // Create and download the file
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export late payments data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <LatePaymentsHeader
            lateRange={lateRange}
            onRangeChange={handleRangeChange}
            showExpiring={showExpiring}
            onShowExpiringChange={handleShowExpiringChange}
          />
          <Button
            onClick={handleExport}
            disabled={isExporting || latePayments.length === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <DownloadIcon className="w-4 h-4" />
            {isExporting ? "Exporting..." : "Export Data"}
          </Button>
        </div>
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
