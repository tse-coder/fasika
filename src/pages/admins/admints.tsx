import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAdmins } from "./hooks/useAdmins";
import { useAdminActions } from "./hooks/useAdminActions";
import { useModalStore } from "@/stores/overlay.store";
import { useAuth } from "@/stores/auth.store";
import { AdminsHeader } from "./components/AdminsHeader";
import { AdminsList } from "./components/AdminsList";
import { AdminCreationForm } from "./components/AdminCreationForm";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Main Admins page component
 * Displays list of administrators with superadmin controls
 */
function Admins() {
  const { admins, isLoading, error, refetch } = useAdmins();
  const {
    handleCreateAdmin,
    handleDeleteAdmin,
    isDeleting,
    isCreating,
    isSuperAdmin,
  } = useAdminActions();
  const { user } = useAuth();
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleAddAdmin = () => {
    setShowCreateForm(true);
    openModal(
      <div className="p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Create New Admin</h2>
          <Button variant="ghost" size="icon" onClick={closeModal}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <AdminCreationForm
          onSubmit={async (data) => {
            const success = await handleCreateAdmin(data);
            if (success) {
              refetch();
              closeModal();
              setShowCreateForm(false);
            }
          }}
          onCancel={() => {
            closeModal();
            setShowCreateForm(false);
          }}
          isLoading={isCreating}
        />
      </div>
    );
  };

  const handleDelete = async (id: number) => {
    await handleDeleteAdmin(id);
    refetch();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AdminsHeader onAddAdmin={handleAddAdmin} canAddAdmin={isSuperAdmin} />
        <AdminsList
          admins={admins}
          isLoading={isLoading}
          error={error}
          onDelete={handleDelete}
          isDeleting={typeof isDeleting === "number"}
          canDelete={isSuperAdmin}
        />
      </div>
    </DashboardLayout>
  );
}

export default Admins;
