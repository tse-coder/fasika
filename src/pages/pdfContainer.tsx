import React from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';

import { Button } from "@/components/ui/button"; // Assuming you use shadcn/ui Button
import { LoaderIcon } from "@/components/ui/skeleton-card"; // Assuming you use your LoaderIcon
import { InvoicePDF } from '@/components/reciept';

// Use the mock data or substitute with your actual form data structure
const invoiceData = {
  child: { id: 101, fname: 'Abebe', lname: 'Kebede' },
  total_amount: 12000,
  months: ["2025-01-01", "2025-02-01", "2025-03-01"],
  method: "CBE", 
  notes: "Payment for first quarter tuition.",
  invoice_no: '00963',
  invoice_date: new Date('2025-12-14'),
  supplier_name: 'Fasika childcare', 
  supplier_address: 'Addis Ababa Ethiopia',
  supplier_tin: '0051601042',
  supplier_vat_reg_no: '12350270819',
  supplier_vat_reg_date: new Date('2017-07-08'),
  supplier_date_of_registration: new Date('2009-01-01'),
};


export function PDFContainer() {
  const filename = `Invoice_${invoiceData.invoice_no}_${invoiceData.child?.lname}.pdf`;

  return (
    <div className="flex flex-col h-[80vh]">
      <div className="p-4 flex gap-4 border-b">
        {/* --- 1. PDF Download Link --- */}
        <PDFDownloadLink 
          document={<InvoicePDF data={invoiceData} />} 
          fileName={filename}
        >
          {({ loading }) => (
            <Button disabled={loading}>
              {loading ? (
                <>
                  <LoaderIcon className="w-4 h-4 mr-2" />
                  Generating PDF...
                </>
              ) : (
                "Download Invoice"
              )}
            </Button>
          )}
        </PDFDownloadLink>

        <Button variant="outline" onClick={() => alert('Print functionality depends on the PDF viewer/browser')}>
          Print PDF
        </Button>
      </div>

      {/* --- 2. PDF Viewer (Required for display in the browser) --- */}
      <div className="flex-grow p-4">
        <PDFViewer width="100%" height="100%" className="border rounded-lg">
          <InvoicePDF data={invoiceData} />
        </PDFViewer>
      </div>
    </div>
  );
}