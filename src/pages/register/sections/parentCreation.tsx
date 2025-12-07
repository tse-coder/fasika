import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import { useState } from "react";

// ------------------------------
// Parent Creation Step
// ------------------------------
export function NewParentStep({
  onSave,
  onCancel,
}: {
  onSave: (data: {
    fname: string;
    lname: string;
    gender: string;
    phone: string;
    email?: string;
  }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    fname: "",
    lname: "",
    gender: "M",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!form.fname.trim()) newErrors.fname = "First name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone is required";
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      newErrors.email = "Invalid email";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      fname: form.fname.trim(),
      lname: form.lname.trim(),
      gender: form.gender,
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-primary" />
          Add New Parent
        </h3>

        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>First Name</Label>
              <Input
                name="fname"
                value={form.fname}
                onChange={handleChange}
                required
                className={errors.fname ? "border-red-500" : ""}
              />
              {errors.fname && (
                <p className="text-red-600 text-sm mt-1">{errors.fname}</p>
              )}
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                name="lname"
                value={form.lname}
                onChange={handleChange}
                className={errors.lname ? "border-red-500" : ""}
              />
            </div>

            <div>
              <Label>Gender</Label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label>Email (optional)</Label>
              <Input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Parent
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
