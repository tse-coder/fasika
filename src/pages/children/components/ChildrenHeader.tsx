import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ChildrenHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
}

/**
 * Header component for the Children page with search and register button
 */
export const ChildrenHeader = ({
  search,
  onSearchChange,
}: ChildrenHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search children..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Link to="/register">
        <Button>Register New Child</Button>
      </Link>
    </div>
  );
};
