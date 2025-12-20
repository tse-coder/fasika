import { useLogin } from "./hooks/useLogin";
import { LoginForm } from "./components/LoginForm";

/**
 * Login page component
 */
const Login = () => {
  const {
    username,
    password,
    isLoading,
    setUsername,
    setPassword,
    handleSubmit,
  } = useLogin();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <LoginForm
        username={username}
        password={password}
        isLoading={isLoading}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Login;
