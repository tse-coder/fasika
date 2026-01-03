import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useParentsData } from "./hooks/useParentsData";
import { ParentsHeader } from "./components/ParentsHeader";
import { ParentsList } from "./components/ParentsList";

/**
 * Main Parents page component
 * Displays list of parents with search, filtering, and pagination
 */
const Parents = () => {
  const {
    list,
    search,
    setSearch,
    isLoading,
    isLoadingMore,
    loadMore,
    debouncedSearch,
  } = useParentsData();

  const handleParentUpdate = () => {
    const params =
      debouncedSearch.trim().length > 0
        ? { query: debouncedSearch.trim(), child_id: "" }
        : { page: 1, child_id: "" };
    // This will be implemented when we have a parents store
    console.log("Parent updated, refresh list with params:", params);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 w-full">
            <ParentsHeader search={search} onSearchChange={setSearch} />
          </div>
        </div>

        <ParentsList
          parents={list}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          showLoadMore={debouncedSearch.trim() === ""}
          debouncedSearch={debouncedSearch}
          onLoadMore={loadMore}
          onParentUpdate={handleParentUpdate}
        />
      </div>
    </DashboardLayout>
  );
};

export default Parents;
