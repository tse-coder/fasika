import React from 'react'
import { PasswordInput } from "@/components/ui/password-input";
type AdminCreationFormProps = {
    onSubmit: (data: any) => void;
}
function AdminCreationForm({onSubmit}: AdminCreationFormProps) {
  const handlesubmit = (e: React.FormEvent) => {
    e.preventDefault();
  }
  return (
    <form onSubmit={handlesubmit} className="space-y-4 stat-card">
        <div className="mb-4">
            <label className="block mb-2 font-medium">Username</label>
            <input type="text" className="w-full p-2 border rounded" required />
        </div>
        <div className="mb-4">
            <PasswordInput
              id="password"
              label="Password"
              className="w-full p-2 border rounded"
              required
            />
        </div>
        <div className="mb-4">
            <label className="block mb-2 font-medium">Role</label>
            <select className="w-full p-2 border rounded" required>
                <option value="superadmin">Super Admin</option>
                <option value="admin">Admin</option>
            </select>
        </div>
        <button type="submit" className="w-full bg-primary text-white p-2 rounded">
            Create Admin
        </button>
    </form>
  )
}

export default AdminCreationForm