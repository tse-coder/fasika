import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

import NotoSansEthiopicRegular from '../fonts/NotoSansEthiopic.ttf'; 

// Register the font
Font.register({ 
  family: 'EthiopicFont', 
  src: NotoSansEthiopicRegular, 
});
// =================================================================

// Utility to convert number to Amharic-based text (simplified/placeholder)
const numberToAmharicWords = (num: number): string => {
  const parts = String(num).split('.');
  const integerPart = parseInt(parts[0], 10);
  // This is a complex function and this implementation is a simple placeholder.
  return `Amount In Words Placeholder: ${integerPart.toLocaleString()} ETB`;
};

// --- Stylesheet ---
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'EthiopicFont', // <-- Using the registered font
    fontSize: 10,
    color: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: '1px solid #000000',
    paddingBottom: 5,
  },
  headerLeft: {},
  headerRight: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 16,
    marginBottom: 2,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 10,
    marginBottom: 10,
  },
  invoiceInfo: {
    marginBottom: 10,
  },
  invoiceTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  detailsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  fromToBox: {
    width: '48%',
    border: '1px solid #000000',
    padding: 5,
  },
  boxTitle: {
    fontSize: 11,
    marginBottom: 5,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  labelAmharic: {
    width: '40%',
    fontFamily: 'EthiopicFont',
  },
  labelEnglish: {
    width: '60%',
    // Keep English labels distinct for clarity, using the same font for simplicity
    fontFamily: 'EthiopicFont', 
    fontSize: 9,
  },
  value: {
    borderBottom: '0.5px dotted #000000',
    flexGrow: 1,
    paddingLeft: 5,
  },
  table: {
    border: '1px solid #000000',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#EEEEEE',
    borderBottom: '1px solid #000000',
    fontFamily: 'EthiopicFont',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5px solid #E0E0E0',
    minHeight: 20,
  },
  tableCellNo: { width: '5%', padding: 3, borderRight: '1px solid #000000', textAlign: 'center' },
  tableCellDescription: { width: '40%', padding: 3, borderRight: '1px solid #000000' },
  tableCellQty: { width: '10%', padding: 3, borderRight: '1px solid #000000', textAlign: 'center' },
  tableCellUnit: { width: '15%', padding: 3, borderRight: '1px solid #000000', textAlign: 'center' },
  tableCellPrice: { width: '15%', padding: 3, borderRight: '1px solid #000000', textAlign: 'right' },
  tableCellAmount: { width: '15%', padding: 3, textAlign: 'right' },

  totalSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  totalBox: {
    width: '40%',
    border: '1px solid #000000',
    padding: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  totalValue: {
    borderBottom: '0.5px dotted #000000',
    width: '50%',
    textAlign: 'right',
    paddingLeft: 5,
  },
  totalRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1px solid #000000',
    paddingTop: 5,
    marginTop: 5,
    backgroundColor: '#F0F0F0',
  },
  totalLabelFinal: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  totalValueFinal: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  footer: {
    borderTop: '1px solid #000000',
    paddingTop: 10,
  },
  words: {
    backgroundColor: '#EEEEEE',
    padding: 5,
    marginBottom: 10,
    minHeight: 20,
  },
  paymentMode: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 8,
    height: 8,
    border: '0.5px solid #000000',
    marginLeft: 5,
    marginRight: 2,
  },
  preparedBy: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
    borderTop: '1px solid #000000',
    paddingTop: 2,
    marginTop: 15,
    textAlign: 'center',
    fontSize: 9,
  },
  distribution: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

// --- Data Typing (Matching the form) ---
interface InvoiceData {
  child: {
    id: number;
    fname: string;
    lname: string;
  } | null;
  total_amount: number;
  months: string[]; // e.g., ["2025-01-01", "2025-02-01"]
  method: string;
  notes?: string;
  // Other details not in form, but needed for invoice
  invoice_no: string;
  invoice_date: Date;
  supplier_name: string;
  supplier_address: string;
  supplier_tin: string;
  supplier_vat_reg_no: string;
  supplier_vat_reg_date: Date;
  supplier_date_of_registration: Date;
}

// --- Invoice Data Mockup (based on the form structure) ---
const mockInvoiceData: InvoiceData = {
  child: { id: 101, fname: 'Abebe', lname: 'Kebede' },
  total_amount: 12000,
  months: ["2025-01-01", "2025-02-01", "2025-03-01"],
  method: "Cash",
  notes: "Payment for first quarter tuition.",
  // Mock data for the invoice fields from the image
  invoice_no: '00963',
  invoice_date: new Date('2025-12-14'),
  supplier_name: 'Fasika childcare', // Use the name from the user's prompt
  supplier_address: 'Addis Ababa Ethiopia',
  supplier_tin: '0051601042',
  supplier_vat_reg_no: '12350270819',
  supplier_vat_reg_date: new Date('2017-07-08'),
  supplier_date_of_registration: new Date('2009-01-01'),
};

// --- PDF Component ---
export const InvoicePDF = ({ data = mockInvoiceData }: { data?: InvoiceData }) => {
  const VAT_RATE = 0.15; 
  const totalAmount = data.total_amount;
  const totalInclVat = totalAmount;
  const subTotal = totalInclVat / (1 + VAT_RATE);
  const vatAmount = totalInclVat - subTotal;

  // Prepare table items
  const tableItems = data.months.map((monthStr, index) => {
    const date = new Date(monthStr);
    const monthName = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();

    const unitPrice = subTotal / data.months.length;
    const itemSubtotal = unitPrice;

    return {
      no: index + 1,
      description: `Tuition Fee - ${monthName} ${year}`,
      qty: 1,
      unit: 'Month',
      unitPrice: unitPrice.toFixed(2),
      totalAmount: itemSubtotal.toFixed(2),
    };
  });
  
  // Fill the rest of the 8 available lines with empty rows
  const emptyRows = Array(8 - tableItems.length).fill({
    no: '',
    description: '',
    qty: '',
    unit: '',
    unitPrice: '',
    totalAmount: '',
  });

  const allTableRows = [...tableItems, ...emptyRows];

  // Helper to render a field row with Amharic/English labels
  const FieldRow = ({ labelAm, labelEn, value }: { labelAm: string; labelEn: string; value: string }) => (
    <View style={styles.fieldRow}>
      <Text style={styles.labelAmharic}>{labelAm}</Text>
      <Text style={styles.labelEnglish}>{labelEn}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  // Helper for the From/To Box structure
  const AddressBox = ({ isFrom, data }: { isFrom: boolean, data: InvoiceData }) => (
    <View style={styles.fromToBox}>
      <Text style={styles.boxTitle}>
        {isFrom ? 'ከ/From' : 'ለ/To'}
      </Text>
      <FieldRow labelAm="ስም/Name" labelEn="N/H N/H" value={isFrom ? data.supplier_name : data.child ? `${data.child.fname} ${data.child.lname}` : ''} />
      <FieldRow labelAm="አድራሻ/Address" labelEn="W/H H. No." value={isFrom ? data.supplier_address : 'Customer Address'} />
      <FieldRow labelAm="የአቅራቢው የተጨማሪ እሴት ታክስ ምዝገባ ቁጥር" labelEn="Supplier's VAT Reg. No" value={data.supplier_vat_reg_no} />
      {isFrom && <FieldRow labelAm="የአቅራቢው የተጨማሪ እሴት ታክስ ቁጥር" labelEn="Supplier's Tin No" value={data.supplier_tin} />}
      {!isFrom && <FieldRow labelAm="የደንበኛው የተጨማሪ እሴት ታክስ ቁጥር" labelEn="Customer's TIN No." value='Customer TIN' />}
      <FieldRow labelAm="ቀን የተመዘገበበት" labelEn="Date of Registration" value={isFrom ? new Date(data.supplier_date_of_registration).toLocaleDateString('en-US') : '-'} />
      <FieldRow labelAm="የተጨማሪ እሴት ታክስ ምዝገባ ቀን" labelEn="Date of VAT Registration" value={new Date(data.supplier_vat_reg_date).toLocaleDateString('en-US')} />
      <FieldRow labelAm="የክፍያ ሁኔታ" labelEn="Mode of Supply" value={data.method} />
    </View>
  );

  // Use "ፋሲካ" for the childcare name as requested
  const ChildCareNameAmharic = "ፋሲካ የልጆች ማቆያ";
  const ChildCareNameEnglish = "Fasika childcare";


  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* --- Header --- */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{ChildCareNameAmharic}</Text>
            <Text style={styles.title}>{ChildCareNameEnglish}</Text>
            <Text style={styles.subtitle}>+251 912 62 53 81 Addis Ababa Ethiopia</Text>
            <View style={styles.invoiceInfo}>
              <Text style={styles.invoiceTitle}>የእሴት ታክስ ሽያጭ ደረሰኝ</Text>
              <Text style={styles.invoiceTitle}>Value Added Tax Sales Invoice</Text>
              <Text style={styles.invoiceTitle}>CASH SALES INVOICE</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text>ቀን /Date {new Date(data.invoice_date).toLocaleDateString('en-US')}</Text>
            <Text style={{ marginTop: 5, fontSize: 14 }}>No **{data.invoice_no}**</Text>
          </View>
        </View>

        {/* --- From/To Details --- */}
        <View style={styles.detailsSection}>
          <AddressBox isFrom={true} data={data} />
          <AddressBox isFrom={false} data={data} />
        </View>

        {/* --- Table --- */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellNo}>ተ/ቁ{"\n"}No</Text>
            <Text style={styles.tableCellDescription}>መግለጫ{"\n"}Description</Text>
            <Text style={styles.tableCellQty}>ብዛት{"\n"}Qty</Text>
            <Text style={styles.tableCellUnit}>መለኪያ{"\n"}Unit</Text>
            <Text style={styles.tableCellPrice}>የዋጋ ክፍያ{"\n"}Unit Price</Text>
            <Text style={styles.tableCellAmount}>ጠቅላላ ዋጋ{"\n"}Total Amount</Text>
          </View>

          {/* Table Rows */}
          {allTableRows.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCellNo}>{item.no}</Text>
              <Text style={styles.tableCellDescription}>{item.description}</Text>
              <Text style={styles.tableCellQty}>{item.qty}</Text>
              <Text style={styles.tableCellUnit}>{item.unit}</Text>
              <Text style={styles.tableCellPrice}>{item.unitPrice}</Text>
              <Text style={styles.tableCellAmount}>{item.totalAmount}</Text>
            </View>
          ))}
        </View>

        {/* --- Totals --- */}
        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <Text>ጠቅላላ /Total</Text>
              <Text style={styles.totalValue}>{subTotal.toFixed(2)}</Text>
            </View>
            {/* <View style={styles.totalRow}>
              <Text>ተ.እ.ታ /VAT (15%)</Text>
              <Text style={styles.totalValue}>{vatAmount.toFixed(2)}</Text>
            </View> */}
            <View style={styles.totalRowFinal}>
              <Text style={styles.totalLabelFinal}>ጠቅላላ ድምር  {"\n"} Total </Text>
              <Text style={styles.totalValueFinal}>{totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* --- Footer Details (Words, Payment, Signature) --- */}
        <View style={styles.footer}>
          <Text style={{ marginBottom: 5 }}>ብር በቃላት{"\n"}In Words</Text>
          <View style={styles.words}>
            <Text>{numberToAmharicWords(totalInclVat)}</Text>
          </View>

          <Text style={{ marginBottom: 5 }}>የክፍያ ዘዴ{"\n"}Mode of Payment</Text>
          <View style={styles.paymentMode}>
            <View style={data.method === 'Cash' ? { ...styles.checkbox, backgroundColor: '#000000' } : styles.checkbox} />
            <Text>ጥሬ ገንዘብ{"\n"}Cash</Text>
            <View style={data.method !== 'Cash' ? { ...styles.checkbox, backgroundColor: '#000000' } : styles.checkbox} />
            <Text>ቼክ{"\n"}Cheque No</Text>
          </View>
          
          <View style={styles.preparedBy}>
            <View>
              <Text>የሠራው{"\n"}Prepared by</Text>
              <Text style={styles.signatureBox}>
                _____________________________{"\n"}
                ተቀባዩ ስም እና ፊርማ{"\n"}Receiver Name & Sig.
              </Text>
            </View>
            <View>
              <Text>ተቀባዩ ስም እና ፊርማ{"\n"}Receiver Name & Sig.</Text>
              <Text style={styles.signatureBox}>
                _____________________________{"\n"}
                ተቀባዩ ስም እና ፊርማ{"\n"}Receiver Name & Sig.
              </Text>
            </View>
          </View>

          <View style={styles.distribution}>
            <Text>የስርጭት{"\n"}Distribution</Text>
            <Text>ዋና ደረሰኝ{"\n"}Original Cus</Text>
            <Text>1ኛ ቅጅ ሻጭ{"\n"}1st Copy saler</Text>
            <Text>2ኛ ቅጅ ታክስ{"\n"}2nd Copy pad</Text>
          </View>
        </View>

        {/* Bottom line (for legal text if needed) */}
        <Text style={{ marginTop: 20, fontSize: 8, textAlign: 'center' }}>
          መ.ገ./ጠ/ጠ/ቢ/C/C ሐምሌ ፮ ቀን ፳፻፯/July 08/2014 ዓ.ም የተፈቀደ ታትሞ 1401/14 ቀጥታ ታትሟል
        </Text>
      </Page>
    </Document>
  );
};