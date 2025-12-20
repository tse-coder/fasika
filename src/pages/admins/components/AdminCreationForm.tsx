import { useState } from "react";
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
import { LoaderIcon } from "@/components/ui/skeleton-card";
import { CreateUserRequest } from "@/types/user.types";

interface AdminCreationFormProps {
  onSubmit: (data: CreateUserRequest & { makeAdmin: boolean }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Form component for creating a new user
 * Users are created as USER by default, then promoted to ADMIN if selected
 */
export const AdminCreationForm = ({
  onSubmit,
  onCancel,
  isLoading = false,
}: AdminCreationFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    makeAdmin: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const submitData: CreateUserRequest & { makeAdmin: boolean } = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
      makeAdmin: formData.makeAdmin,
    };

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={isLoading}
          required
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={isLoading}
          required
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          disabled={isLoading}
          required
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          disabled={isLoading}
          required
          minLength={8}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Password must be at least 8 characters
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="makeAdmin">Grant Admin Privileges</Label>
        <Select
          value={formData.makeAdmin ? "yes" : "no"}
          onValueChange={(value) =>
            setFormData({ ...formData, makeAdmin: value === "yes" })
          }
          disabled={isLoading}
        >
          <SelectTrigger id="makeAdmin">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no">Regular Admin</SelectItem>
            <SelectItem value="yes">SuperAdmin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <LoaderIcon className="w-4 h-4 mr-2" />
              Creating...
            </>
          ) : (
            "Create Admin"
          )}
        </Button>
      </div>
    </form>
  );
};
