import { User } from "@/types/user.types";
import { delay } from "./utils";
import { mockUsers, type MockUser } from "./data";

const sanitizeUser = (user: MockUser): User => {
  const { password, ...rest } = user;
  return rest;
};

// Local definitions to avoid importing from the real API layer
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  name: string;
  email: string;
  sub: string;
  role: "ADMIN" | "USER";
}


/**
 * Mock login using existing admin/user JSON
 */
export const mockLogin = async (
  data: LoginRequest
): Promise<LoginResponse & { user: User }> => {
  await delay();
  console.log(mockUsers)
  console.log(data.email, data.password)
  const found = mockUsers.find(
    (u) => {
        console.log(u.email.toLowerCase(), data.email.toLowerCase())
        return u.email.toLowerCase() === data.email.toLowerCase()
    }

  );
  if (!found || found.password !== data.password) {
    throw new Error("Invalid credentials");
  }

  const payload = btoa(
    JSON.stringify({
      sub: found.id,
      role: found.role,
      branch: found.branch,
      name: found.name,
      email: found.email,
    })
  );
  const access_token = `mock.${payload}.token`;
  // @ts-expect-error
  return { access_token, user: sanitizeUser(found) };
};
