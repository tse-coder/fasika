import { Search } from "lucide-react";

interface ParentsHeaderProps {
  search: string;
  onSearchChange: (search: string) => void;
}

export const ParentsHeader = ({ search, onSearchChange }: ParentsHeaderProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <input
          type="text"
          placeholder="Search parents by name, email, or phone..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
        />
      </div>
    </div>
  );
};
