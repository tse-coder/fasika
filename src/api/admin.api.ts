import { Admin } from "@/types/admins.types";


export const createAdmin = async (username: string, password: string, role: 'superadmin' | 'admin') => {
    const response = await fetch('/api/admins', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, role }),
    });

    if (!response.ok) {
        throw new Error('Failed to create admin');
    }

    const data = await response.json();
    return data as Admin;
};

export const fetchAdmins = async (): Promise<Admin[]> => {
    const responst = await fetch('/api/admins', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!responst.ok) {
        throw new Error('Failed to fetch admins');
    }

    const data = await responst.json();
    return data as Admin[];
}

export const deleteAdmin = async (id: number) => {
    const response = await fetch(`/api/admins/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to delete admin');
    }

    return true;
}