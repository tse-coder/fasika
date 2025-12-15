import React from "react";
import { formatDate } from "date-fns";

interface InvoiceData {
  child: {
    id: number;
    fname: string;
    lname: string;
  } | null;
  total_amount: number;
  months: string[];
  method: string;
  notes?: string;
  invoice_no: string;
  invoice_date: Date;
  supplier_name: string;
  supplier_address: string;
  supplier_tin: string;
  supplier_vat_reg_no: string;
  supplier_vat_reg_date: Date;
  supplier_date_of_registration: Date;
}

interface InvoiceTemplateProps {
  data: InvoiceData;
}

// Utility to convert number to words (simplified placeholder)
const numberToWords = (num: number): string => {
  const parts = String(num).split(".");
  const integerPart = parseInt(parts[0], 10);
  return `Amount In Words Placeholder: ${integerPart.toLocaleString()} ETB`;
};

export function InvoiceTemplate({ data }: InvoiceTemplateProps) {
  const VAT_RATE = 0.15;
  const totalAmount = data.total_amount || 0;
  const totalInclVat = totalAmount;
  const subTotal = totalInclVat / (1 + VAT_RATE);
  const vatAmount = totalInclVat - subTotal;

  // Prepare table items
  const tableItems = (data.months || []).map((monthStr, index) => {
    try {
      const date = new Date(monthStr);
      const monthName = date.toLocaleString("en-US", { month: "long" });
      const year = date.getFullYear();
      const monthCount = data.months.length || 1;
      const unitPrice = subTotal / monthCount;
      const itemSubtotal = unitPrice;

      return {
        no: index + 1,
        description: `Tuition Fee - ${monthName} ${year}`,
        qty: 1,
        unit: "Month",
        unitPrice: unitPrice.toFixed(2),
        totalAmount: itemSubtotal.toFixed(2),
      };
    } catch (err) {
      return {
        no: index + 1,
        description: `Tuition Fee - Invalid Date`,
        qty: 1,
        unit: "Month",
        unitPrice: "0.00",
        totalAmount: "0.00",
      };
    }
  });

  // Fill the rest of the 8 available lines with empty rows
  const emptyRows = Array(Math.max(0, 8 - tableItems.length))
    .fill(null)
    .map(() => ({
      no: "",
      description: "",
      qty: "",
      unit: "",
      unitPrice: "",
      totalAmount: "",
    }));

  const allTableRows = [...tableItems, ...emptyRows];

  return (
    <div
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
        fontSize: "10pt",
        color: "#000000",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
          borderBottom: "1px solid #000000",
          paddingBottom: "5px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "16pt",
              marginBottom: "2px",
              fontWeight: "bold",
            }}
          >
            ፋሲካ የልጆች ማቆያ
          </div>
          <div
            style={{
              fontSize: "16pt",
              marginBottom: "2px",
              fontWeight: "bold",
            }}
          >
            Fasika childcare
          </div>
          <div style={{ fontSize: "10pt", marginBottom: "10px" }}>
            +251 912 62 53 81 Addis Ababa Ethiopia
          </div>
          <div style={{ marginBottom: "10px" }}>
            <div
              style={{
                fontSize: "12pt",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              የእሴት ታክስ ሽያጭ ደረሰኝ
            </div>
            <div
              style={{
                fontSize: "12pt",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              Value Added Tax Sales Invoice
            </div>
            <div style={{ fontSize: "12pt", fontWeight: "bold" }}>
              CASH SALES INVOICE
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div>ቀን /Date {formatDate(data.invoice_date, "yyyy-MM-dd")}</div>
          <div style={{ marginTop: "5px", fontSize: "14pt" }}>
            No **{data.invoice_no}**
          </div>
        </div>
      </div>

      {/* From/To Details */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        {/* From Box */}
        <div
          style={{
            width: "48%",
            border: "1px solid #000000",
            padding: "5px",
          }}
        >
          <div style={{ fontSize: "11pt", marginBottom: "5px" }}>ከ/From</div>
          <FieldRow
            labelAm="ስም/Name"
            labelEn="N/H N/H"
            value={data.supplier_name}
          />
          <FieldRow
            labelAm="አድራሻ/Address"
            labelEn="W/H H. No."
            value={data.supplier_address}
          />
          <FieldRow
            labelAm="የአቅራቢው የተጨማሪ እሴት ታክስ ምዝገባ ቁጥር"
            labelEn="Supplier's VAT Reg. No"
            value={data.supplier_vat_reg_no}
          />
          <FieldRow
            labelAm="የአቅራቢው የተጨማሪ እሴት ታክስ ቁጥር"
            labelEn="Supplier's Tin No"
            value={data.supplier_tin}
          />
          <FieldRow
            labelAm="የደንበኛው የተጨማሪ እሴት ታክስ ቁጥር"
            labelEn="Customer's TIN No."
            value="Customer TIN"
          />
          <FieldRow
            labelAm="ቀን የተመዘገበበት"
            labelEn="Date of Registration"
            value={formatDate(data.supplier_date_of_registration, "yyyy-MM-dd")}
          />
          <FieldRow
            labelAm="የተጨማሪ እሴት ታክስ ምዝገባ ቀን"
            labelEn="Date of VAT Registration"
            value={formatDate(data.supplier_vat_reg_date, "yyyy-MM-dd")}
          />
          <FieldRow
            labelAm="የክፍያ ሁኔታ"
            labelEn="Mode of Supply"
            value={data.method}
          />
        </div>

        {/* To Box */}
        <div
          style={{
            width: "48%",
            border: "1px solid #000000",
            padding: "5px",
          }}
        >
          <div style={{ fontSize: "11pt", marginBottom: "5px" }}>ለ/To</div>
          <FieldRow
            labelAm="ስም/Name"
            labelEn="N/H N/H"
            value={data.child ? `${data.child.fname} ${data.child.lname}` : ""}
          />
          <FieldRow
            labelAm="አድራሻ/Address"
            labelEn="W/H H. No."
            value="Customer Address"
          />
          <FieldRow
            labelAm="የአቅራቢው የተጨማሪ እሴት ታክስ ምዝገባ ቁጥር"
            labelEn="Supplier's VAT Reg. No"
            value={data.supplier_vat_reg_no}
          />
          <FieldRow
            labelAm="የደንበኛው የተጨማሪ እሴት ታክስ ቁጥር"
            labelEn="Customer's TIN No."
            value="Customer TIN"
          />
          <FieldRow
            labelAm="ቀን የተመዘገበበት"
            labelEn="Date of Registration"
            value="-"
          />
          <FieldRow
            labelAm="የተጨማሪ እሴት ታክስ ምዝገባ ቀን"
            labelEn="Date of VAT Registration"
            value={formatDate(data.supplier_vat_reg_date, "yyyy-MM-dd")}
          />
          <FieldRow
            labelAm="የክፍያ ሁኔታ"
            labelEn="Mode of Supply"
            value={data.method}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ border: "1px solid #000000", marginBottom: "10px" }}>
        {/* Table Header */}
        <div
          style={{
            display: "flex",
            backgroundColor: "#EEEEEE",
            borderBottom: "1px solid #000000",
          }}
        >
          <TableCell width="5%" style={{ textAlign: "center" }}>
            ተ/ቁ
            <br />
            No
          </TableCell>
          <TableCell width="40%">
            መግለጫ
            <br />
            Description
          </TableCell>
          <TableCell width="10%" style={{ textAlign: "center" }}>
            ብዛት
            <br />
            Qty
          </TableCell>
          <TableCell width="15%" style={{ textAlign: "center" }}>
            መለኪያ
            <br />
            Unit
          </TableCell>
          <TableCell width="15%" style={{ textAlign: "right" }}>
            የዋጋ ክፍያ
            <br />
            Unit Price
          </TableCell>
          <TableCell width="15%" style={{ textAlign: "right" }}>
            ጠቅላላ ዋጋ
            <br />
            Total Amount
          </TableCell>
        </div>

        {/* Table Rows */}
        {allTableRows.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              borderBottom:
                index < allTableRows.length - 1
                  ? "0.5px solid #E0E0E0"
                  : "none",
              minHeight: "20px",
            }}
          >
            <TableCell width="5%" style={{ textAlign: "center" }}>
              {item.no}
            </TableCell>
            <TableCell width="40%">{item.description}</TableCell>
            <TableCell width="10%" style={{ textAlign: "center" }}>
              {item.qty}
            </TableCell>
            <TableCell width="15%" style={{ textAlign: "center" }}>
              {item.unit}
            </TableCell>
            <TableCell width="15%" style={{ textAlign: "right" }}>
              {item.unitPrice}
            </TableCell>
            <TableCell width="15%" style={{ textAlign: "right" }}>
              {item.totalAmount}
            </TableCell>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width: "40%",
            border: "1px solid #000000",
            padding: "5px",
          }}
        >
          <TotalRow label="ጠቅላላ /Total" value={subTotal.toFixed(2)} />
          <TotalRow label="ተ.እ.ታ /VAT (15%)" value={vatAmount.toFixed(2)} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid #000000",
              paddingTop: "5px",
              marginTop: "5px",
              backgroundColor: "#F0F0F0",
            }}
          >
            <div style={{ fontSize: "11pt", fontWeight: "bold" }}>
              ጠቅላላ ድምር (ተ.እ.ታን ጨምሮ)
              <br />
              Total (Incl. VAT)
            </div>
            <div style={{ fontSize: "11pt", fontWeight: "bold" }}>
              {totalInclVat.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #000000", paddingTop: "10px" }}>
        <div style={{ marginBottom: "5px" }}>
          ብር በቃላት
          <br />
          In Words
        </div>
        <div
          style={{
            backgroundColor: "#EEEEEE",
            padding: "5px",
            marginBottom: "10px",
            minHeight: "20px",
          }}
        >
          {numberToWords(totalInclVat)}
        </div>

        <div style={{ marginBottom: "5px" }}>
          የክፍያ ዘዴ
          <br />
          Mode of Payment
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              border: "0.5px solid #000000",
              marginLeft: "5px",
              marginRight: "2px",
              backgroundColor:
                data.method === "Cash" ? "#000000" : "transparent",
            }}
          />
          <div>
            ጥሬ ገንዘብ
            <br />
            Cash
          </div>
          <div
            style={{
              width: "8px",
              height: "8px",
              border: "0.5px solid #000000",
              marginLeft: "5px",
              marginRight: "2px",
              backgroundColor:
                data.method !== "Cash" ? "#000000" : "transparent",
            }}
          />
          <div>
            ቼክ
            <br />
            Cheque No
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
          }}
        >
          <div>
            <div>
              የሠራው
              <br />
              Prepared by
            </div>
            <div
              style={{
                borderTop: "1px solid #000000",
                paddingTop: "2px",
                marginTop: "15px",
                textAlign: "center",
                fontSize: "9pt",
              }}
            >
              _____________________________
              <br />
              ተቀባዩ ስም እና ፊርማ
              <br />
              Receiver Name & Sig.
            </div>
          </div>
          <div>
            <div>
              ተቀባዩ ስም እና ፊርማ
              <br />
              Receiver Name & Sig.
            </div>
            <div
              style={{
                borderTop: "1px solid #000000",
                paddingTop: "2px",
                marginTop: "15px",
                textAlign: "center",
                fontSize: "9pt",
              }}
            >
              _____________________________
              <br />
              ተቀባዩ ስም እና ፊርማ
              <br />
              Receiver Name & Sig.
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
          }}
        >
          <div>
            የስርጭት
            <br />
            Distribution
          </div>
          <div>
            ዋና ደረሰኝ
            <br />
            Original Cus
          </div>
          <div>
            1ኛ ቅጅ ሻጭ
            <br />
            1st Copy saler
          </div>
          <div>
            2ኛ ቅጅ ታክስ
            <br />
            2nd Copy pad
          </div>
        </div>
      </div>

      {/* Bottom line */}
      <div style={{ marginTop: "20px", fontSize: "8pt", textAlign: "center" }}>
        መ.ገ./ጠ/ጠ/ቢ/C/C ሐምሌ ፮ ቀን ፳፻፯/July 08/2014 ዓ.ም የተፈቀደ ታትሞ 1401/14 ቀጥታ ታትሟል
      </div>
    </div>
  );
}

// Helper components
function FieldRow({
  labelAm,
  labelEn,
  value,
}: {
  labelAm: string;
  labelEn: string;
  value: string;
}) {
  return (
    <div style={{ display: "flex", marginBottom: "2px" }}>
      <div style={{ width: "40%" }}>{labelAm}</div>
      <div style={{ width: "60%", fontSize: "9pt" }}>{labelEn}</div>
      <div
        style={{
          borderBottom: "0.5px dotted #000000",
          flexGrow: 1,
          paddingLeft: "5px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function TableCell({
  width,
  children,
  style = {},
}: {
  width: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width,
        padding: "3px",
        borderRight: "1px solid #000000",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "3px",
      }}
    >
      <div>{label}</div>
      <div
        style={{
          borderBottom: "0.5px dotted #000000",
          width: "50%",
          textAlign: "right",
          paddingLeft: "5px",
        }}
      >
        {value}
      </div>
    </div>
  );
}
