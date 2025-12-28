import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { mockResetPassword } from "@/mock/api";
import { useAuth } from "@/stores/auth.store";
import { useToast } from "@/hooks/use-toast";
import { resetUserPassword } from "@/api/admin.api";

export const PasswordChangeSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
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
      await resetUserPassword(user.id, { newPassword });
      toast({
        variant: "default",
        description: "Password changed successfully",
      });
      resetForm();
      setIsOpen(false); // Close after success
    } catch (err) {
      setError("Failed to change password");
    } finally {
      setIsChanging(false);
    }
  };

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  const toggle = () => {
    setIsOpen(!isOpen);
    if (isOpen) resetForm(); // Clear when closing
  };

  return (
    <div className="border-t pt-4">
      <Button
        variant="ghost"
        className="w-full justify-between text-left font-medium"
        onClick={toggle}
      >
        <span>Change Password</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      {isOpen && (
        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
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
      )}
    </div>
  );
};