import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { LoaderIcon } from "@/components/ui/skeleton-card";

interface LoginFormProps {
  username: string;
  password: string;
  isLoading: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Login form component
 */
export const LoginForm = ({
  username,
  password,
  isLoading,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) => {
  return (
    <Card className="w-full max-w-md">
      <img src="logo.png" alt="logo" className="w-full" />
      <CardHeader className="space-y-1">
        <CardDescription className="text-center">
          Sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoaderIcon className="w-4 h-4 mr-2" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
          <div className="text-center text-sm text-muted-foreground mt-4">
            <p>Demo Credentials:</p>
            <p className="font-mono text-xs mt-1">
              Username: admin
              <br />
              Password: admin123
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
