import { Button } from "@/components/ui/button";
import { LoaderIcon } from "@/components/ui/skeleton-card";
import React from "react";
interface HeaderProps {
  isLoading: boolean;
  local: boolean;
  currentBranch: string;
  handleSave: () => void;
}

function Header({ isLoading, local, currentBranch, handleSave }: HeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Payment Information</h1>
        <p className="text-muted-foreground">
          Branch: {currentBranch}. Edit fees and discounts.
        </p>
      </div>
      <Button onClick={handleSave} disabled={isLoading || !local}>
        {isLoading ? <LoaderIcon className="w-4 h-4 mr-2" /> : null}
        Save Changes
      </Button>
    </div>
  );
}

export default Header;
