import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Child } from "@/types/child.types";
import { Branch } from "@/types/api.types";
import { Program } from "@/types/child.types";
import { useBranchStore } from "@/stores/branch.store";
import { useToast } from "@/hooks/use-toast";
import { updateChild } from "@/api/child.api";

interface ChildEditOverlayProps {
  child: Child | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedChild: Child) => void;
}

export const ChildEditOverlay = ({ child, isOpen, onClose, onUpdate }: ChildEditOverlayProps) => {
  const { toast } = useToast();
  const { branches } = useBranchStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    gender: "",
    birthdate: "",
    branch: "" as Branch,
    program: "" as Program,
    has_discount: false,
    discount_percent: 0,
    discount_note: "",
  });

  // Reset form when child changes
  useEffect(() => {
    if (child) {
      setFormData({
        fname: child.fname,
        lname: child.lname,
        gender: child.gender,
        birthdate: child.birthdate,
        branch: child.branch,
        program: child.program || "kindergarten",
        has_discount: child.has_discount,
        discount_percent: child.discount_percent || 0,
        discount_note: child.discountNote || "",
      });
    }
  }, [child]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!child) return;

    setIsSubmitting(true);
    try {
      const updatedChild = await updateChild(child.id, {
        fname: formData.fname,
        lname: formData.lname,
        gender: formData.gender as "M" | "F",
        birthdate: formData.birthdate,
        branch: formData.branch,
        program: formData.program,
        has_discount: formData.has_discount,
        discount_percent: formData.has_discount ? formData.discount_percent : 0,
        discountNote: formData.has_discount ? formData.discount_note : "",
      });

      toast({
        title: "Success",
        description: `${formData.fname} ${formData.lname} has been updated.`,
      });

      onUpdate(updatedChild);
      onClose();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to update child.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen || !child) return null;

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
                <Label htmlFor="birthdate">Date of Birth</Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={formData.birthdate ? formData.birthdate.split('T')[0] : ''}
                  onChange={(e) => handleInputChange("birthdate", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="branch">Branch</Label>
                <Select value={formData.branch} onValueChange={(value) => handleInputChange("branch", value as Branch)}>
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
              </div>
              <div>
                <Label htmlFor="program">Program</Label>
                <Select value={formData.program} onValueChange={(value) => handleInputChange("program", value as Program)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kindergarten">Kindergarten</SelectItem>
                    <SelectItem value="childcare">Childcare</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="has_discount"
                  checked={formData.has_discount}
                  onChange={(e) => handleInputChange("has_discount", e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="has_discount">Has Discount</Label>
              </div>

              {formData.has_discount && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div>
                    <Label htmlFor="discount_percent">Discount Percentage (%)</Label>
                    <Input
                      id="discount_percent"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount_percent}
                      onChange={(e) => handleInputChange("discount_percent", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount_note">Discount Note</Label>
                    <Input
                      id="discount_note"
                      value={formData.discount_note}
                      onChange={(e) => handleInputChange("discount_note", e.target.value)}
                      placeholder="Reason for discount..."
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Badge variant={child.is_active ? "default" : "secondary"}>
                {child.is_active ? "Active" : "Inactive"}
              </Badge>
              <span className="text-sm text-muted-foreground">Status cannot be changed here</span>
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
