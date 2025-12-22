import users from "./data/admin.json"; // <-- your existing file

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

/**
 * Mock password reset
 */
export const mockResetPassword = async (
  userId: string,
  data: { newPassword: string }
): Promise<void> => {
  console.log("[MOCK API] resetPassword - start", userId);

  // Simulate network latency
  await new Promise((res) => setTimeout(res, 300));

  const userIndex = (users as any[]).findIndex(
    (u) => u.id === userId && u.isDeleted === false
  );

  if (userIndex === -1) {
    console.error("[MOCK API] resetPassword - user not found");
    throw new Error("User not found");
  }

  // Update password in mock data
  (users as any[])[userIndex].password = data.newPassword;

  console.log("[MOCK API] resetPassword - success", userId);
};
