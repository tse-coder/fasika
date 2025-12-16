import { DialogTitle } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
import { UserCircle, X } from "lucide-react";
import React from "react";
import AdminCreationForm from "./adminCreationForm";
import { toast } from "sonner";

function EmptyState() {
  return (
    <div className="text-center py-16 bg-card rounded-xl border">
      {/* icon that shows unavailiabilty */}
      <X className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
      <h3 className="text-lg font-semibold mb-2">Not available</h3>
      <p className="text-muted-foreground mb-4">This Section is under developement</p>
      {/* <Dialog>
        <DialogTrigger>Add Admin</DialogTrigger>
        <DialogContent>
            <DialogTitle>Add New Admin</DialogTitle>
            <AdminCreationForm onSubmit={(data) => {
                toast.success("Admin created successfully!");
            }} />
        </DialogContent>
      </Dialog> */}
    </div>
  );
}

export default EmptyState;
