import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { LoaderIcon } from "@/components/ui/skeleton-card";
import { calculateAge } from "@/lib/utils";
import { formatMonth } from "../utils/latePaymentsUtils";
import type { LatePaymentChild } from "../hooks/useLatePayments";

interface LatePaymentRowProps {
  child: LatePaymentChild;
  isSendingEmail: boolean;
  onSendNotification: (child: LatePaymentChild) => void;
}

/**
 * Component to display a single late payment row in the table
 */
export const LatePaymentRow = ({
  child,
  isSendingEmail,
  onSendNotification,
}: LatePaymentRowProps) => {
  // Determine badge variant based on months late
  const getBadgeVariant = () => {
    if (child.monthsLate > 3) return "destructive";
    if (child.monthsLate > 2) return "default";
    return "secondary";
  };

  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      {/* Child Name */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-primary text-sm font-medium">
              {child.fname[0]}
              {child.lname[0]}
            </span>
          </div>
          <span className="font-medium">
            {child.fname} {child.lname}
          </span>
        </div>
      </td>

      {/* Age */}
      <td className="py-4 px-4 text-muted-foreground">
        {calculateAge(child.birthdate)} years
      </td>

      {/* Months Late */}
      <td className="py-4 px-4">
        <Badge variant={getBadgeVariant()}>
          {child.monthsLate} month{child.monthsLate !== 1 ? "s" : ""}
        </Badge>
      </td>

      {/* Unpaid Months */}
      <td className="py-4 px-4 text-muted-foreground">
        <div className="flex flex-wrap gap-1">
          {child.unpaidMonths.slice(0, 3).map((month) => (
            <Badge key={month} variant="outline" className="text-xs">
              {formatMonth(month)}
            </Badge>
          ))}
          {child.unpaidMonths.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{child.unpaidMonths.length - 3} more
            </Badge>
          )}
        </div>
      </td>

      {/* Monthly Fee */}
      <td className="py-4 px-4">
        <span className="font-semibold">
          ETB {child.monthlyFee?.toLocaleString() ?? "0"}
        </span>
      </td>

      {/* Actions */}
      <td className="py-4 px-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSendNotification(child)}
          disabled={isSendingEmail}
        >
          {isSendingEmail ? (
            <>
              <LoaderIcon className="w-4 h-4 mr-2" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Notify
            </>
          )}
        </Button>
      </td>
    </tr>
  );
};
