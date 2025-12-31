import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaymentCategory } from "./PaymentTypeSelector";

interface AmountInputProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  error?: string;
  selectedChild: any;
  selectedCategory: PaymentCategory;
  isAutoFilled?: boolean;
}

export function AmountInput({
  amount,
  onAmountChange,
  error,
  selectedChild,
  selectedCategory,
  isAutoFilled = false,
}: AmountInputProps) {
  const isReadOnly = selectedChild && amount !== "" && isAutoFilled;
  const showAutoFillMessage = isAutoFilled && amount && 
    (selectedCategory === "registration" || selectedCategory === "recurring");

  return (
    <div className="space-y-2">
      <Label>Total Amount (ETB)</Label>
      <Input
        type="number"
        step="0.01"
        min="0"
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        placeholder="Enter total amount"
        className={error ? "border-red-500" : ""}
        disabled={!selectedChild}
        readOnly={isReadOnly}
      />
      
      {showAutoFillMessage && (
        <p className="text-xs text-muted-foreground">
          Amount auto-filled based on payment type and discount
        </p>
      )}
      
      {selectedChild && amount && !isAutoFilled && (
        <p className="text-xs text-muted-foreground">
          Enter amount manually for this payment type
        </p>
      )}
      
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
}
