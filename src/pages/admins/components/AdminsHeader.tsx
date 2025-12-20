import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AdminsHeaderProps {
  onAddAdmin: () => void;
  canAddAdmin: boolean;
}

/**
 * Header component for the Admins page
 */
export const AdminsHeader = ({
  onAddAdmin,
  canAddAdmin,
}: AdminsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Administrators</h1>
        <p className="text-muted-foreground">Manage system administrators</p>
      </div>
      {canAddAdmin && (
        <Button onClick={onAddAdmin}>
          <Plus className="w-4 h-4 mr-2" />
          Add Admin
        </Button>
      )}
    </div>
  );
};
