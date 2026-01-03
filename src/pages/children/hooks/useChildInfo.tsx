import { useModalStore } from "@/stores/overlay.store";
import { Child } from "@/types/child.types";
import InfoOverlay from "../sections/infoOverlay";
import { ChildEditOverlay } from "../components/ChildEditOverlay";
import { LoaderIcon } from "@/components/ui/skeleton-card";
import { fetchParentById, fetchParents } from "@/api/parent.api";
import { useChildren } from "@/stores/children.store";
// import { fetchParentById } from "@/mock/parent.mock";

/**
 * Custom hook to handle child info overlay display
 */
export const useChildInfo = () => {
  const openModal = useModalStore((state) => state.openModal);
  const { fetchChildren } = useChildren();

  const showInfoOverlay = async (child: Child) => {

    // Show loading overlay
    openModal(
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <LoaderIcon className="w-6 h-6" />
        <p className="text-sm text-muted-foreground">Fetching parent details...</p>
      </div>
    );

    try {
      const parents = await fetchParents({ child_id: child.id})
      
      openModal(<InfoOverlay child={child} parentInfo={parents.data} />);
      console.log("[Children] Parent info loaded", parents);
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

  const showEditOverlay = (child: Child) => {
    openModal(
      <ChildEditOverlay
        child={child}
        isOpen={true}
        onClose={() => openModal(null)}
        onUpdate={async (updatedChild) => {
          // Refresh the children list after update
          await fetchChildren();
          // Close the modal after successful update
          openModal(null);
        }}
      />
    );
  };

  return { showInfoOverlay, showEditOverlay };
};