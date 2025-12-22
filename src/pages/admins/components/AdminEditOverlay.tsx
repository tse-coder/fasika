import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Admin } from "@/types/admins.types";
import { Branch } from "@/types/api.types";
import { useState } from "react";

interface AdminEditOverlayProps {
  admin: Admin;
  branches: Branch[];
  onSave: (data: {
    name: string;
    email: string;
    branch: Branch;
    role: "ADMIN" | "USER";
  }) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

/**
 * Overlay component for editing admin information
 */
export const AdminEditOverlay = ({
  admin,
  branches,
  onSave,
  onCancel,
  isSaving = false,
}: AdminEditOverlayProps) => {
  const [formData, setFormData] = useState({
    name: admin.name,
    email: admin.email,
    branch: admin.branch,
    role: admin.role,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.email.includes("@")) newErrors.email = "Invalid email format";
    if (!formData.branch) newErrors.branch = "Branch is required";
    if (!formData.role) newErrors.role = "Role is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  return (
    <div className="p-6 max-w-md w-full">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Edit Admin</h2>

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Enter name"
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="Enter email"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="branch">Branch</Label>
          <Select
            value={formData.branch}
            onValueChange={(value) => handleChange("branch", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.branch && (
            <p className="text-sm text-red-500">{errors.branch}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => handleChange("role", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
