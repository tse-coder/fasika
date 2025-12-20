import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { Admin } from "@/types/admins.types";
import { LoaderIcon } from "@/components/ui/skeleton-card";

interface AdminRowProps {
  admin: Admin;
  onDelete: (id: number) => void;
  isDeleting: boolean;
  canDelete: boolean;
}

/**
 * Component to display a single admin row in the table
 */
export const AdminRow = ({
  admin,
  onDelete,
  isDeleting,
  canDelete,
}: AdminRowProps) => {
  const canDeleteThisAdmin = canDelete;

  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-primary text-sm font-medium">
              {admin.username[0]?.toUpperCase() || "A"}
            </span>
          </div>
          <span className="font-medium">{admin.username}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <Badge variant={admin.role === "superadmin" ? "default" : "secondary"}>
          {admin.role === "superadmin" ? "Super Admin" : "Admin"}
        </Badge>
      </td>
      <td className="py-4 px-4 text-muted-foreground text-sm">
        {new Date(admin.created_at).toLocaleDateString()}
      </td>
      <td className="py-4 px-4">
        {canDeleteThisAdmin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(admin.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <LoaderIcon className="w-4 h-4" />
            ) : (
              <Trash2 className="w-4 h-4 text-destructive" />
            )}
          </Button>
        )}
      </td>
    </tr>
  );
};
