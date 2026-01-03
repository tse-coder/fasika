import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Parent } from "@/types/parent.types";
import { MoreVertical, Edit, Trash2, Eye, Phone, Mail, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateParent, deleteParent } from "@/api/parent.api";
import { ParentEditOverlay } from "../components/ParentEditOverlay";
import { ParentInfoOverlay } from "../components/ParentInfoOverlay";
import { useModalStore } from "@/stores/overlay.store";

type ParentCardProps = {
  parent: Parent;
  onParentUpdate?: (updatedParent?: Parent) => void;
};

function ParentCard({ parent, onParentUpdate }: ParentCardProps) {
  const { toast } = useToast();
  const openModal = useModalStore((state) => state.openModal);
  const [isDeleting, setIsDeleting] = useState(false);

  const showInfoOverlay = (parent: Parent) => {
    openModal(
      <ParentInfoOverlay
        parent={parent}
        isOpen={true}
        onClose={() => openModal(null)}
      />
    );
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteParent(parent.id);
      toast({
        title: "Deleted",
        description: `${parent.fname} ${parent.lname} has been deleted.`,
      });
      if (onParentUpdate) {
        onParentUpdate();
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message || "Failed to delete parent.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    openModal(
      <ParentEditOverlay
        parent={parent}
        isOpen={true}
        onClose={() => openModal(null)}
        onUpdate={async (updatedParent) => {
          // Refresh the list after update
          if (onParentUpdate) {
            onParentUpdate(updatedParent);
          }
          openModal(null);
        }}
      />
    );
  };

  return (
    <div
      key={parent.id}
      className="stat-card cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>

          <div>
            <h3 className="font-semibold text-foreground">
              {parent.fname} {parent.lname}
            </h3>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); showInfoOverlay(parent); }}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Parent</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {parent.fname} {parent.lname}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 pt-4 border-t border-border space-y-2">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground truncate">{parent.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{parent.phone}</p>
        </div>
      </div>
    </div>
  );
}

export default ParentCard;
