import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/stores/auth.store";
import { useToast } from "@/hooks/use-toast";
import { resetUserPassword } from "@/api/admin.api";
import { changePassword } from "@/api/auth.api";

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
    if (!currentPassword) {
      setError("Current password is required");
      return;
    }

    setIsChanging(true);
    setError("");

    try {
      // Use the new changePassword API that validates current password
      await changePassword({
        currentPassword,
        newPassword,
        userId: user.id,
        userEmail: user.email
      });
      
      toast({
        variant: "default",
        description: "Password changed successfully",
      });
      resetForm();
      setIsOpen(false); // Close after success
    } catch (err: any) {
      // Handle specific error messages from backend
      if (err?.response?.status === 401) {
        setError("Current password is incorrect");
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to change password");
      }
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
            <PasswordInput
              id="currentPassword"
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>

          <div className="space-y-2">
            <PasswordInput
              id="newPassword"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>

          <div className="space-y-2">
            <PasswordInput
              id="confirmPassword"
              label="Confirm New Password"
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