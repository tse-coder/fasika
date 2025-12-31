import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAYMENT_METHODS = ["Cash", "CBE", "Dashen Bank"];

interface PaymentMethodProps {
  method: string;
  onMethodChange: (method: string) => void;
  error?: string;
  selectedChild: any;
}

export function PaymentMethod({
  method,
  onMethodChange,
  error,
  selectedChild,
}: PaymentMethodProps) {
  return (
    <div className="space-y-2">
      <Label>Payment Method</Label>
      <Select
        value={method}
        onValueChange={onMethodChange}
        disabled={!selectedChild}
      >
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder="Select payment method" />
        </SelectTrigger>
        <SelectContent>
          {PAYMENT_METHODS.map((method) => (
            <SelectItem key={method} value={method}>
              {method}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
}
