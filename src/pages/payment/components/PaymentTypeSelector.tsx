import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export type PaymentCategory = "registration" | "recurring" | "therapy" | "after school" | "other";

interface PaymentTypeSelectorProps {
  selectedCategory: PaymentCategory;
  onCategoryChange: (category: PaymentCategory) => void;
  hasRegistrationPaid: boolean | null;
  isCheckingRegistration: boolean;
  selectedChild: any;
  registrationFee: number;
  recurringInfo: any;
  getUpcomingMonths: (count: number) => string[];
  discountPercent: number;
}

export function PaymentTypeSelector({
  selectedCategory,
  onCategoryChange,
  hasRegistrationPaid,
  isCheckingRegistration,
  selectedChild,
  registrationFee,
  recurringInfo,
  getUpcomingMonths,
  discountPercent,
}: PaymentTypeSelectorProps) {
  const handleCategoryChange = (category: PaymentCategory) => {
    onCategoryChange(category);
  };

  return (
    <div className="space-y-2">
      <Label>Payment Type</Label>
      <div className="flex flex-wrap gap-2">
        {/* Only show registration button if not already paid */}
        {hasRegistrationPaid === false && (
          <Button
            type="button"
            variant={selectedCategory === "registration" ? "default" : "outline"}
            onClick={() => handleCategoryChange("registration")}
            disabled={!selectedChild || isCheckingRegistration}
          >
            Registration
          </Button>
        )}

        <Button
          type="button"
          variant={selectedCategory === "recurring" ? "default" : "outline"}
          onClick={() => handleCategoryChange("recurring")}
          disabled={!selectedChild || isCheckingRegistration}
        >
          {recurringInfo?.schedule === "quarterly" ? "Quarterly" : "Monthly"}
        </Button>

        <Button
          type="button"
          variant={selectedCategory === "therapy" ? "default" : "outline"}
          onClick={() => handleCategoryChange("therapy")}
          disabled={!selectedChild}
        >
          Therapy
        </Button>

        <Button
          type="button"
          variant={selectedCategory === "after school" ? "default" : "outline"}
          onClick={() => handleCategoryChange("after school")}
          disabled={!selectedChild}
        >
          After School
        </Button>

        <Button
          type="button"
          variant={selectedCategory === "other" ? "default" : "outline"}
          onClick={() => handleCategoryChange("other")}
          disabled={!selectedChild}
        >
          Other Payments
        </Button>
      </div>

      {/* Only show loading message while checking registration */}
      {selectedChild && isCheckingRegistration && (
        <p className="text-xs text-muted-foreground animate-pulse">
          Checking registration status...
        </p>
      )}
    </div>
  );
}
