import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAdmins } from "./hooks/useAdmins";
import { useAdminActions } from "./hooks/useAdminActions";
import { useModalStore } from "@/stores/overlay.store";
import { useAuth } from "@/stores/auth.store";
import { AdminsHeader } from "./components/AdminsHeader";
import { AdminsList } from "./components/AdminsList";
import { AdminCreationForm } from "./components/AdminCreationForm";

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
    );
  };

  const handleDelete = async (id: string) => {
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
          isDeleting={isDeleting !== null}
          canDelete={isSuperAdmin}
        />
      </div>
    </DashboardLayout>
  );
}

export default Admins;
