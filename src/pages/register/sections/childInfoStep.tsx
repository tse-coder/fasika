import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

// ------------------------------
// Child Information Step
// ------------------------------
export function ChildInfoStep({
  form,
  onChange,
  errors = {},
}: {
  form: any;
  onChange: any;
  errors?: Record<string, string>;
}) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6 space-y-6">
        <h3 className="font-semibold flex items-center gap-2 text-lg">
          <User className="w-5 h-5 text-primary" />
          Child Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>First Name</Label>
            <Input
              name="firstName"
              value={form.firstName}
              onChange={onChange}
              required
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && (
              <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <Label>Last Name</Label>
            <Input
              name="lastName"
              value={form.lastName}
              onChange={onChange}
              required
              className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && (
              <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>

          <div>
            <Label>Gender</Label>
            <select
              name="gender"
              value={form.gender || ""}
              onChange={onChange}
              className={`w-full rounded border px-3 py-2 ${
                errors.gender ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
            {errors.gender && (
              <p className="text-red-600 text-sm mt-1">{errors.gender}</p>
            )}
          </div>

            <div>
              <Label>Relationship to Selected Parent</Label>
              <select
                name="relationship"
                value={form.relationship || "guardian"}
                onChange={onChange}
                className={`w-full rounded border px-3 py-2 ${
                  errors.relationship ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="guardian">Guardian</option>
                <option value="mother">Mother</option>
                <option value="father">Father</option>
                <option value="sibling">Sibling</option>
                <option value="other">Other</option>
              </select>
              {errors.relationship && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.relationship}
                </p>
              )}
            </div>

          <div className="md:col-span-2">
            <Label>Date of Birth (optional if Age provided)</Label>
            <Input
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={onChange}
              className={errors.dateOfBirth ? "border-red-500" : ""}
            />
            {errors.dateOfBirth && (
              <p className="text-red-600 text-sm mt-1">{errors.dateOfBirth}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
