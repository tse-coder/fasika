import { DialogTitle } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
import { UserCircle } from "lucide-react";
import React from "react";
import AdminCreationForm from "./adminCreationForm";
import { toast } from "sonner";

function EmptyState() {
  return (
    <div className="text-center py-16 bg-card rounded-xl border">
      <UserCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
      <h3 className="text-lg font-semibold mb-2">No Admins found</h3>
      <p className="text-muted-foreground mb-4">Start by registering admin</p>
      <Dialog>
        <DialogTrigger>Add Admin</DialogTrigger>
        <DialogContent>
            <DialogTitle>Add New Admin</DialogTitle>
            <AdminCreationForm onSubmit={(data) => {
                toast.success("Admin created successfully!");
            }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EmptyState;
