import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Admin } from "@/types/admins.types";
import { useAdminActions } from "./hooks/useAdminActions";
import { useModalStore } from "@/stores/overlay.store";
import { useAuth } from "@/stores/auth.store";
import { AdminsHeader } from "./components/AdminsHeader";
import { AdminsList } from "./components/AdminsList";
import { AdminEditOverlay } from "./components/AdminEditOverlay";
import { Navigate } from "react-router-dom";
import { useAdmins } from "./hooks/useAdmins";
import { AdminCreationForm } from "./components/AdminCreationForm";
import { useBranchStore } from "@/stores/branch.store";

/**
 * Main Admins page component
 * Displays list of administrators with superadmin controls
 */
function Admins() {
  const { admins, isLoading, error, refetch } = useAdmins();
  const { branches } = useBranchStore();
  const {
    handleCreateAdmin,
    handleDeleteAdmin,
    isDeleting,
    isCreating,
    isSuperAdmin,
    isEditing,
    handleEdit,
  } = useAdminActions();
  const { user } = useAuth();
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  if (user?.role !== "ADMIN") {
    return <Navigate to="/payments" replace />;
  }

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

  const handleEditAdmin = (id: string) => {
    const admin = admins.find((a) => a.id === id);
    if (admin) {
      setEditingAdmin(admin);
      openModal(
        <AdminEditOverlay
          admin={admin}
          branches={branches}
          onSave={async (data) => {
            const success = await handleEdit(id, data);
            if (success) {
              refetch();
              closeModal();
              setEditingAdmin(null);
            }
          }}
          onCancel={() => {
            closeModal();
            setEditingAdmin(null);
          }}
          isSaving={isEditing === id}
        />
      );
    }
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
          canEdit={isSuperAdmin}
          isEditing={isEditing}
          onEdit={handleEditAdmin}
        />
      </div>
    </DashboardLayout>
  );
}

export default Admins;
