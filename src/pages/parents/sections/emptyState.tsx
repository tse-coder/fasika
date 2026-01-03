import { Search } from "lucide-react";

interface EmptyStateProps {
  message?: string;
}

export const EmptyState = ({ message = "No parents found" }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {message}
      </h3>
      <p className="text-muted-foreground max-w-md">
        Try adjusting your search or filters to find what you're looking for.
      </p>
    </div>
  );
};
