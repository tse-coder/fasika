import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { calculateAge } from "@/lib/utils";
import { Child } from "@/types/child.types";
import { MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { updateChild } from "@/api/child.api";
// import { updateChild } from "@/mock/child.mock";

type ChildCardProps = {
  child: Child;
  showInfoOverlay: (child: any) => void;
  onChildUpdate?: (updatedChild?: Child) => void;
};

function ChildCard({ child, showInfoOverlay, onChildUpdate }: ChildCardProps) {
  const { toast } = useToast();

  const handleToggleActivate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !child.is_active;
    
    // Create updated child object for immediate UI update
    const updatedChild = { ...child, is_active: newStatus };
    
    try {
      await updateChild(child.id, { is_active: newStatus });
      toast({
        title: newStatus ? "Activated" : "Deactivated",
        description: `${child.fname} ${child.lname} has been ${newStatus ? "activated" : "deactivated"}.`,
      });
      
      // Immediately update UI with the new status
      if (onChildUpdate) {
        onChildUpdate(updatedChild);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message || "Failed to update child status.",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      key={child.id}
      className="stat-card cursor-pointer"
      onClick={() => showInfoOverlay(child)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold text-lg">
              {child.fname[0]}
              {child.lname[0]}
            </span>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">
              {child.fname} {child.lname}
            </h3>

            <Badge variant={child.is_active ? "default" : "secondary"}>
              {child.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <Link to={`/payments?child=${child.id}`}>
              <DropdownMenuItem>View Payments</DropdownMenuItem>
            </Link>
              <DropdownMenuItem onClick={handleToggleActivate}>
                {child.is_active ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground">Age</p>
          <p className="font-medium">{calculateAge(child.birthdate)} years</p>
        </div>
      </div>
    </div>
  );
}

export default ChildCard;
