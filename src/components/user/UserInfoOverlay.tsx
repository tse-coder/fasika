import { PasswordChangeSection } from "./passwordChangeSection";
import { UserInfoSection } from "./userInfoSection";

interface UserInfoOverlayProps {
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  onClose: () => void;
  onUpdate?: (data: { name: string; email: string }) => void;
}

export const UserInfoOverlay = ({
  name,
  email,
  role,
  onClose,
  onUpdate,
}: UserInfoOverlayProps) => {
  return (
    <div className="p-6 max-w-md w-full">
      <div className="space-y-6">
        <UserInfoSection
          name={name}
          email={email}
          role={role}
          onUpdate={onUpdate}
        />
        <PasswordChangeSection />
      </div>
    </div>
  );
};