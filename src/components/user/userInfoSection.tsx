import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Save, X as CancelIcon } from "lucide-react";
import { useState } from "react";

interface UserInfoSectionProps {
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  onUpdate?: (data: { name: string; email: string }) => void;
}

export const UserInfoSection = ({
  name,
  email,
  role,
  onUpdate,
}: UserInfoSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({ name: editName, email: editEmail });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(name);
    setEditEmail(email);
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      {/* Name */}
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

      {/* Email */}
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

      {/* Save/Cancel Buttons */}
      {isEditing && (
        <div className="flex gap-2">
          <Button onClick={handleSave} size="sm">
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button onClick={handleCancel} variant="outline" size="sm">
            <CancelIcon className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        </div>
      )}

      {/* Role (read-only) */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Role</p>
        <p className="text-base">{role === "ADMIN" ? "Admin" : "User"}</p>
      </div>
    </div>
  );
};