import { LoaderIcon } from "@/components/ui/skeleton-card";
import { AdminRow } from "./AdminRow";
import { Admin } from "@/types/admins.types";
import EmptyState from "../sections/emptyState";

interface AdminsListProps {
  admins: Admin[];
  isLoading: boolean;
  error: string | null;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  canDelete: boolean;
  onEdit: (id: string) => void;
  canEdit: boolean;
  isEditing: boolean
}

/**
 * Component to display the list of admins in a table
 */
export const AdminsList = ({
  admins,
  isLoading,
  error,
  onDelete,
  isDeleting,
  canDelete,
  onEdit,
  canEdit,
  isEditing
}: AdminsListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoaderIcon className="w-6 h-6 mr-2" />
        <p>Loading admins...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive">Error loading admins: {error}</p>
      </div>
    );
  }

  if (admins.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="stat-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-4 font-semibold text-foreground">
                User
              </th>
              <th className="text-left py-4 px-4 font-semibold text-foreground">
                Branch
              </th>
              <th className="text-left py-4 px-4 font-semibold text-foreground">
                Role
              </th>
              <th className="text-left py-4 px-4 font-semibold text-foreground">
                Created
              </th>
              <th className="text-left py-4 px-4 font-semibold text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <AdminRow
                key={admin.id}
                admin={admin}
                onDelete={onDelete}
                isDeleting={isDeleting}
                canDelete={canDelete}
                canEdit={canEdit}
                isEditing={isEditing}
                onEdit={onEdit}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
