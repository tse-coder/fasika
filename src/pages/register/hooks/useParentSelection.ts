import { useState, useEffect } from "react";
import { useParents } from "@/stores/parent.store";
import { Parent } from "@/types/parent.types";

/**
 * Custom hook to manage parent selection and search
 */
export const useParentSelection = () => {
  const { fetchParents, isLoading: parentsLoading } = useParents();
  const [parentPage, setParentPage] = useState(1);
  const [parentSearch, setParentSearch] = useState("");
  const [isLoadingMoreParents, setIsLoadingMoreParents] = useState(false);
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const [parentList, setParentList] = useState<Parent[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoadingMoreParents(true);
        const trimmed = parentSearch.trim();
        const params =
          trimmed.length > 0
            ? { query: trimmed }
            : {
                page: parentPage,
              };

        const data = (await fetchParents(params)) || [];

        if (!mounted) return;

        setParentList((prev) =>
          parentPage === 1
            ? data
            : [
                ...prev,
                ...data.filter(
                  (parent) => !prev.some((p) => p.id === parent.id)
                ),
              ]
        );
      } catch (e) {
        // swallow - store handles errors
      } finally {
        if (mounted) setIsLoadingMoreParents(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [parentPage, parentSearch, fetchParents]);

  return {
    parentList,
    parentPage,
    setParentPage,
    parentSearch,
    setParentSearch,
    selectedParent,
    setSelectedParent,
    isLoading: parentsLoading || isLoadingMoreParents,
  };
};
