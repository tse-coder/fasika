import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface UserInfoOverlayProps {
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  onClose: () => void;
}

/**
 * Component to display user information
 * Note: Profile updates require admin privileges via the users management page
 */
export const UserInfoOverlay = ({
  name,
  email,
  role,
  onClose,
}: UserInfoOverlayProps) => {
  return (
    <div className="p-6 max-w-md w-full">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Name</p>
          <p className="text-base">{name}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Email</p>
          <p className="text-base">{email}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Role</p>
          <p className="text-base">{role === "ADMIN" ? "Admin" : "User"}</p>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            To update your profile or password, please contact an administrator.
          </p>
        </div>

      </div>
    </div>
  );
};
