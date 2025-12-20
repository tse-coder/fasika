import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderIcon } from "@/components/ui/skeleton-card";
import { X } from "lucide-react";

interface UserInfoOverlayProps {
  username: string;
  onUpdate: (data: {
    username?: string;
    password?: string;
  }) => Promise<boolean>;
  onClose: () => void;
  isLoading?: boolean;
}

/**
 * Component to display and edit user information
 */
export const UserInfoOverlay = ({
  username,
  onUpdate,
  onClose,
  isLoading = false,
}: UserInfoOverlayProps) => {
  const [formData, setFormData] = useState({
    username: username,
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    // Only validate password if user wants to change it
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters";
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const updateData: { username?: string; password?: string } = {};

    if (formData.username !== username) {
      updateData.username = formData.username;
    }

    if (formData.newPassword) {
      updateData.password = formData.newPassword;
    }

    if (Object.keys(updateData).length > 0) {
      await onUpdate(updateData);
    }
  };

  return (
    <div className="p-6 max-w-md w-full">

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            disabled={isLoading}
            required
          />
          {errors.username && (
            <p className="text-sm text-destructive">{errors.username}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">
            New Password (leave blank to keep current)
          </Label>
          <Input
            id="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={(e) =>
              setFormData({ ...formData, newPassword: e.target.value })
            }
            disabled={isLoading}
            placeholder="Enter new password"
          />
          {errors.newPassword && (
            <p className="text-sm text-destructive">{errors.newPassword}</p>
          )}
        </div>

        {formData.newPassword && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              disabled={isLoading}
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoaderIcon className="w-4 h-4 mr-2" />
                Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
