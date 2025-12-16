import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAdminsStore } from "@/stores/admins.store";
import React from "react";
import EmptyState from "./sections/emptyState";

function Admins() {
  const { admins, fetchAdmins, isLoading, error } = useAdminsStore();
  React.useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);
  return (
    <DashboardLayout>
      <div>
        {/* admins list */}
        <div>
          {isLoading ? (
            <p>Loading admins...</p>
          ) : error ? (
            <p>Error loading admins: {error}</p>
          ) : admins.length === 0 ? (
            <EmptyState />
          ) : (
            <ul>
              {admins.map((admin) => (
                <li key={admin.id}>
                  {admin.username} - {admin.role}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Admins;
