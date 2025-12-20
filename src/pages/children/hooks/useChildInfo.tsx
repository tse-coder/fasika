import { useModalStore } from "@/stores/overlay.store";
import { fetchParentById } from "@/api/parent.api";
import { Child } from "@/types/child.types";
import InfoOverlay from "../sections/infoOverlay";
import { LoaderIcon } from "@/components/ui/skeleton-card";

/**
 * Custom hook to handle child info overlay display
 */
export const useChildInfo = () => {
  const openModal = useModalStore((state) => state.openModal);

  const showInfoOverlay = async (child: Child) => {
    const parentIds = (child.parents || []).map((p) => p.id).filter(Boolean);

    if (parentIds.length === 0) {
      openModal(<InfoOverlay child={child} parentInfo={[]} />);
      return;
    }

    // Show loading overlay
    openModal(
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <LoaderIcon className="w-6 h-6" />
        <p className="text-sm text-muted-foreground">Fetching parent details...</p>
      </div>
    );

    try {
      const parents = (
        await Promise.all(parentIds.map((id) => fetchParentById(id)))
      ).filter(Boolean);

      openModal(<InfoOverlay child={child} parentInfo={parents} />);
    } catch (err) {
      console.error("[Children] Failed to load parent info", err);
      openModal(
        <div className="py-6">
          <p className="font-semibold">Unable to load parent details.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Please try again.
          </p>
        </div>
      );
    }
  };

  return { showInfoOverlay };
};