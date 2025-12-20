import { Users } from "lucide-react";

/**
 * Empty state component when no admins are found
 */
function EmptyState() {
  return (
    <div className="text-center py-16 bg-card rounded-xl border">
      <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
      <h3 className="text-lg font-semibold mb-2">No Admins Found</h3>
      <p className="text-muted-foreground mb-4">
        No administrators have been created yet.
      </p>
    </div>
  );
}

export default EmptyState;
