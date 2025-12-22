import { Button } from "@/components/ui/button";
import { Download, Printer, X } from "lucide-react";
import { useRef } from "react";
// @ts-expect-error - html2pdf doesn't have proper types
import html2pdf from "html2pdf.js";
import { InvoiceTemplate } from "./invoiceTemplate";
import type { Child } from "@/types/child.types";
import type { CreatePaymentResponse } from "@/types/payment.types";

type InvoiceOverlayProps = {
  payment: CreatePaymentResponse;
  child: Child | null;
  onClose: () => void;
};

type Html2pdfOptions = {
  margin: number | [number, number, number, number];
  filename: string;
  image: { type: "jpeg" | "png" | "webp"; quality: number };
  html2canvas: { scale: number; useCORS: boolean ; windowWidth: number };
  jsPDF: { unit: string; format: string; orientation: "portrait" | "landscape" };
};

export function InvoiceOverlay({
  payment,
  child,
  onClose,
}: InvoiceOverlayProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Validate payment data
  if (!payment || !payment.payment) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="text-muted-foreground">
          Invalid payment data. Please try again.
        </p>
        <Button onClick={onClose} className="mt-4">
          Close
        </Button>
      </div>
    );
  }

  const handleDownload = async () => {
    if (!invoiceRef.current) return;

    try {
      const filename = `Invoice_${payment.payment.id}_${
        child?.lname || "Payment"
      }.pdf`;

      const opt: Html2pdfOptions = {
        margin: 0,
        filename: filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 1, useCORS: true, windowWidth: 794 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(invoiceRef.current).save();
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handlePrint = () => {
    if (!invoiceRef.current) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice</title>
          <style>
            @media print {
              @page {
                margin: 0.5in;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          ${invoiceRef.current.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  // Prepare invoice data
  const invoiceData = {
    child: child
      ? {
          id: child.id,
          fname: child.fname,
          lname: child.lname,
        }
      : null,
    total_amount: parseFloat(payment.payment.total_amount),
    months: payment.recordedMonths,
    method: payment.payment.method,
    notes: payment.payment.notes || undefined,
    invoice_no: String(payment.payment.id).padStart(5, "0"),
    invoice_date: new Date(payment.payment.payment_date),
    supplier_name: "Fasika childcare",
    supplier_address: "Addis Ababa Ethiopia",
    supplier_tin: "0051601042",
    supplier_vat_reg_no: "12350270819",
    supplier_vat_reg_date: new Date("2017-07-08"),
    supplier_date_of_registration: new Date("2009-01-01"),
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payment Invoice</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleDownload} className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        <Button onClick={handlePrint} variant="outline" className="flex-1">
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
      </div>

      {/* Preview - This also serves as the source for PDF generation */}
      <div className="border rounded-lg p-4 bg-background overflow-auto">
        <div ref={invoiceRef}>
          {(() => {
            try {
              if (!invoiceData.months || invoiceData.months.length === 0) {
                return (
                  <div className="p-4 text-center text-muted-foreground">
                    <p>No months data available for invoice</p>
                  </div>
                );
              }
              return <InvoiceTemplate data={invoiceData} />;
            } catch (error) {
              console.error("Error rendering invoice template:", error);
              return (
                <div className="p-4 text-center text-muted-foreground">
                  <p>Error rendering invoice. Please try again.</p>
                  <Button onClick={onClose} className="mt-4" variant="outline">
                    Close
                  </Button>
                </div>
              );
            }
          })()}
        </div>
      </div>
    </div>
  );
}
