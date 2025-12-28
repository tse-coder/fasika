import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pen, PenLine, Trash2 } from "lucide-react";
import { Admin } from "@/types/admins.types";
import { LoaderIcon } from "@/components/ui/skeleton-card";
import { useAuth } from "@/stores/auth.store";

interface AdminRowProps {
  admin: Admin;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  canDelete: boolean;
  onEdit: (id: string) => void;
  isEditing: string;
  canEdit: boolean;
}

/**
 * Component to display a single admin row in the table
 */
export const AdminRow = ({
  admin,
  onDelete,
  isDeleting,
  canDelete,
  onEdit,
  isEditing,
  canEdit,
}: AdminRowProps) => {
  const canDeleteThisAdmin = canDelete;
  const isCurrentlyDeleting = isDeleting;
  const isCurrentlyEditing = isEditing;
  const canEditThisAdmin = canEdit && admin.id !== "u-admin-1"; // Can't edit super admin
  const {user} = useAuth()
  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-primary text-sm font-medium">
              {admin.name[0]?.toUpperCase() || "A"}
            </span>
          </div>
          <div>
            <span className="font-medium">{admin.name}</span>
            <p className="text-xs text-muted-foreground">{admin.email}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <Badge variant="outline">{admin.branch}</Badge>
      </td>
      <td className="py-4 px-4">
        <Badge variant={admin.role === "ADMIN" ? "default" : "secondary"}>
          {admin.role === "ADMIN" ? "Admin" : "User"}
        </Badge>
      </td>
      <td className="py-4 px-4 text-muted-foreground text-sm">
        {new Date(admin.createdAt).toLocaleDateString()}
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          {canEditThisAdmin && user.id !== admin.id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(admin.id)}
              disabled={isCurrentlyEditing === admin.id}
            >
              {isCurrentlyEditing === admin.id ? (
                <LoaderIcon className="w-4 h-4" />
              ) : (
                <PenLine className="w-4 h-4 text-blue-500" />
              )}
            </Button>
          )}
          {canDeleteThisAdmin && user.id !== admin.id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(admin.id)}
              disabled={isCurrentlyDeleting}
            >
              {isCurrentlyDeleting ? (
                <LoaderIcon className="w-4 h-4" />
              ) : (
                <Trash2 className="w-4 h-4 text-destructive" />
              )}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};
