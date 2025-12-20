import { useLogin } from "./hooks/useLogin";
import { LoginForm } from "./components/LoginForm";

/**
 * Login page component
 */
const Login = () => {
  const { email, password, isLoading, setEmail, setPassword, handleSubmit } =
    useLogin();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <LoginForm
        email={email}
        password={password}
        isLoading={isLoading}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Login;
