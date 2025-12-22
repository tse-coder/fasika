import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useState } from "react";
import { mockResetPassword } from "@/mock/api";
import { useAuth } from "@/stores/auth.store";

interface UserInfoOverlayProps {
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  onClose: () => void;
}

/**
 * Component to display user information and allow password change
 */
export const UserInfoOverlay = ({
  name,
  email,
  role,
  onClose,
}: UserInfoOverlayProps) => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState("");

  const handlePasswordChange = async () => {
    if (!user?.id) return;
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    setIsChanging(true);
    setError("");
    try {
      await mockResetPassword(user.id, { newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      alert("Password changed successfully");
    } catch (err) {
      setError("Failed to change password");
    } finally {
      setIsChanging(false);
    }
  };

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

        <div className="pt-4 border-t space-y-4">
          <h3 className="text-sm font-medium">Change Password</h3>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            onClick={handlePasswordChange}
            disabled={isChanging || !currentPassword || !newPassword || !confirmPassword}
            className="w-full"
          >
            {isChanging ? "Changing..." : "Change Password"}
          </Button>
        </div>

      </div>
    </div>
  );
};
