import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Edit, Save, X as CancelIcon } from "lucide-react";
import { useState } from "react";
import { mockResetPassword } from "@/mock/api";
import { useAuth } from "@/stores/auth.store";
import { Toast } from "../ui/toast";
import { useToast } from "@/hooks/use-toast";

interface UserInfoOverlayProps {
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  onClose: () => void;
  onUpdate?: (data: { name: string; email: string }) => void;
}

/**
 * Component to display user information and allow editing
 */
export const UserInfoOverlay = ({
  name,
  email,
  role,
  onClose,
  onUpdate,
}: UserInfoOverlayProps) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState("");

  const handlePasswordChange = async () => {
    const {toast} = useToast();
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
      toast({ variant: "default", description: "Password changed successfully" });
    } catch (err) {
      setError("Failed to change password");
    } finally {
      setIsChanging(false);
    }
  };

  const handleSaveProfile = () => {
    if (onUpdate) {
      onUpdate({ name: editName, email: editEmail });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(name);
    setEditEmail(email);
    setIsEditing(false);
  };

  return (
    <div className="p-6 max-w-md w-full">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            {!isEditing && onUpdate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Enter name"
            />
          ) : (
            <p className="text-base">{name}</p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Email</p>
          {isEditing ? (
            <Input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="Enter email"
            />
          ) : (
            <p className="text-base">{email}</p>
          )}
        </div>

        {isEditing && (
          <div className="flex gap-2">
            <Button onClick={handleSaveProfile} size="sm">
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button onClick={handleCancelEdit} variant="outline" size="sm">
              <CancelIcon className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </div>
        )}

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
            disabled={
              isChanging || !currentPassword || !newPassword || !confirmPassword
            }
            className="w-full"
          >
            {isChanging ? "Changing..." : "Change Password"}
          </Button>
        </div>
      </div>
    </div>
  );
};
