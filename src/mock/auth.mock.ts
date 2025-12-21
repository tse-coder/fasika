import { LoginRequest, LoginResponse } from "@/api/auth.api";
import users from "./data/admin.json"; // <-- your existing file


/**
 * Mock login using existing admin/user JSON
 */
export const login = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  console.log("[MOCK API] login - start", data.email);

  // Simulate network latency
  await new Promise((res) => setTimeout(res, 300));

  const user = (users as any[]).find(
    (u) =>
      u.email === data.email &&
      u.password === data.password &&
      u.isDeleted === false
  );

  if (!user) {
    console.error("[MOCK API] login - invalid credentials");
    throw new Error("Invalid email or password");
  }

  /**
   * Fake JWT payload
   */
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    iat: Date.now(),
  };

  const token =
    "mock.jwt." + btoa(JSON.stringify(payload));

  console.log("[MOCK API] login - success", user.email);

  return {
    access_token: token,
    name: user.name,
    email: user.email,
    sub: user.sub,
    role: user.role
  };
};
