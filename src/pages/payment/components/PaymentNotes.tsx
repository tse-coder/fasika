import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PaymentNotesProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  error?: string;
  selectedChild: any;
}

export function PaymentNotes({
  notes,
  onNotesChange,
  error,
  selectedChild,
}: PaymentNotesProps) {
  return (
    <div className="space-y-2">
      <Label>Notes (Optional)</Label>
      <Textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Add any additional notes..."
        rows={3}
        maxLength={255}
        className={error ? "border-red-500" : ""}
        disabled={!selectedChild}
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <p className="text-xs text-muted-foreground">
        {notes.length}/255 characters
      </p>
    </div>
  );
}
