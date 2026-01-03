import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Parent } from "@/types/parent.types";
import { useToast } from "@/hooks/use-toast";
import { updateParent } from "@/api/parent.api";

interface ParentEditOverlayProps {
  parent: Parent | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedParent: Parent) => void;
}

export const ParentEditOverlay = ({ parent, isOpen, onClose, onUpdate }: ParentEditOverlayProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    gender: "",
    phone: "",
    email: "",
  });

  // Reset form when parent changes
  useEffect(() => {
    if (parent) {
      setFormData({
        fname: parent.fname,
        lname: parent.lname,
        gender: parent.gender,
        phone: parent.phone,
        email: parent.email,
      });
    }
  }, [parent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parent) return;

    setIsSubmitting(true);
    try {
      const updatedParent = await updateParent(parent.id, {
        fname: formData.fname,
        lname: formData.lname,
        gender: formData.gender as "M" | "F",
        phone: formData.phone,
        email: formData.email,
      });

      toast({
        title: "Success",
        description: `${formData.fname} ${formData.lname} has been updated.`,
      });

      onUpdate(updatedParent);
      onClose();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to update parent.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen || !parent) return null;

  return (
    <div className="p-6">

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fname">First Name</Label>
                <Input
                  id="fname"
                  value={formData.fname}
                  onChange={(e) => handleInputChange("fname", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lname">Last Name</Label>
                <Input
                  id="lname"
                  value={formData.lname}
                  onChange={(e) => handleInputChange("lname", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
    </div>
  );
};
