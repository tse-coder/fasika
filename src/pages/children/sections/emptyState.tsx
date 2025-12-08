import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import { Link } from "react-router-dom";

function EmptyState() {
  return (
    <div className="text-center py-16 bg-card rounded-xl border">
      <UserCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
      <h3 className="text-lg font-semibold mb-2">No children found</h3>
      <p className="text-muted-foreground mb-4">
        Start by registering your first child
      </p>
      <Link to="/register">
        <Button>Register Child</Button>
      </Link>
    </div>
  );
}

export default EmptyState;
