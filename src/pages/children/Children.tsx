import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useChildrenData } from "./hooks/useChildrenData";
import { useChildInfo } from "./hooks/useChildInfo";
import { useChildren } from "@/stores/children.store";
import { ChildrenHeader } from "./components/ChildrenHeader";
import { ChildrenFilters } from "./components/ChildrenFilters";
import { ChildrenList } from "./components/ChildrenList";

/**
 * Main Children page component
 * Displays list of children with search, filtering, and pagination
 */
const Children = () => {
  const { fetchChildren } = useChildren();
  const {
    list,
    search,
    setSearch,
    activeFilter,
    setActiveFilter,
    isLoading,
    isLoadingMore,
    loadMore,
    debouncedSearch,
  } = useChildrenData();
  const { showInfoOverlay } = useChildInfo();
  const [minAge, setMinAge] = useState<string>("");
  const [maxAge, setMaxAge] = useState<string>("");

  const handleClearFilters = () => {
    setMinAge("");
    setMaxAge("");
    setActiveFilter("all");
  };

  const handleChildUpdate = () => {
    const params =
      debouncedSearch.trim().length > 0
        ? { query: debouncedSearch.trim() }
        : { page: 1 };
    fetchChildren(params);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 w-full">
            <ChildrenHeader search={search} onSearchChange={setSearch} />
          </div>
          <div className="w-full lg:w-auto">
            <ChildrenFilters
              activeFilter={activeFilter}
              onActiveFilterChange={setActiveFilter}
              minAge={minAge}
              maxAge={maxAge}
              onMinAgeChange={setMinAge}
              onMaxAgeChange={setMaxAge}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>

        <ChildrenList
          children={list}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          showLoadMore={debouncedSearch.trim() === ""}
          minAge={minAge}
          maxAge={maxAge}
          activeFilter={activeFilter}
          debouncedSearch={debouncedSearch}
          onLoadMore={loadMore}
          onShowInfo={showInfoOverlay}
          onChildUpdate={handleChildUpdate}
        />
      </div>
    </DashboardLayout>
  );
};

export default Children;
