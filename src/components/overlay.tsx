"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useModalStore } from "@/stores/overlay.store";

export function OverlayModal() {
  const { isOpen, closeModal, content } = useModalStore();

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent>
        {content}
      </DialogContent>
    </Dialog>
  );
}
