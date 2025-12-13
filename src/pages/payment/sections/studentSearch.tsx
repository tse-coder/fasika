import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LoaderIcon } from "@/components/ui/skeleton-card";
import { useChildren } from "@/stores/children.store";
import type { Child } from "@/types/child.types";
import { cn } from "@/lib/utils";

interface StudentSearchProps {
  selectedChildren: Child[];
  onSelect: (child: Child) => void;
  onRemove: (childId: number) => void;
}

export function StudentSearch({
  selectedChildren,
  onSelect,
  onRemove,
}: StudentSearchProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Child[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { fetchChildren, isLoading } = useChildren();
  const debounceTimer = useRef<number | null>(null);
  const requestIdRef = useRef(0);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  // Fetch children when debounced search changes
  useEffect(() => {
    let cancelled = false;
    const currentRequest = ++requestIdRef.current;

    const loadChildren = async () => {
      setIsSearching(true);
      try {
        const params =
          debouncedSearch.trim().length > 0
            ? { query: debouncedSearch.trim() }
            : { page: 1 };

        const data = (await fetchChildren(params)) || [];

        if (cancelled || currentRequest !== requestIdRef.current) return;

        // Filter out already selected children
        const selectedIds = new Set(selectedChildren.map((c) => c.id));
        const filtered = data.filter((child) => !selectedIds.has(child.id));

        setSearchResults(filtered);
      } catch (err) {
        console.error("[StudentSearch] Failed to fetch children", err);
        setSearchResults([]);
      } finally {
        if (!cancelled && currentRequest === requestIdRef.current) {
          setIsSearching(false);
        }
      }
    };

    if (open) {
      loadChildren();
    }

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, open, fetchChildren, selectedChildren]);

  const handleSelect = (child: Child) => {
    onSelect(child);
    setSearch("");
    setOpen(false);
  };

  const isSelected = (childId: number) => {
    return selectedChildren.some((c) => c.id === childId);
  };

  return (
    <div className="space-y-3">
      {/* Selected Children Filters */}
      {selectedChildren.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedChildren.map((child) => (
            <Badge
              key={child.id}
              variant="secondary"
              className="px-3 py-1.5 text-sm flex items-center gap-2"
            >
              <span>
                {child.fname} {child.lname}
              </span>
              <button
                type="button"
                onClick={() => onRemove(child.id)}
                className="ml-1 rounded-full hover:bg-muted transition-colors p-0.5"
                aria-label={`Remove ${child.fname} ${child.lname}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative flex-1 max-w-sm">
          <PopoverTrigger asChild>
            <Input
              placeholder="Search and select students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setOpen(true)}
              className="pl-10"
            />
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search children..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {isSearching || isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <LoaderIcon className="w-5 h-5" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Searching...
                  </span>
                </div>
              ) : searchResults.length === 0 ? (
                <CommandEmpty>
                  {debouncedSearch.trim()
                    ? "No children found"
                    : "Start typing to search..."}
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {searchResults.map((child) => (
                    <CommandItem
                      key={child.id}
                      value={`${child.fname} ${child.lname}`}
                      onSelect={() => handleSelect(child)}
                      disabled={isSelected(child.id)}
                      className={cn(
                        isSelected(child.id) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary text-xs font-medium">
                            {child.fname[0]}
                            {child.lname[0]}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {child.fname} {child.lname}
                          </span>
                          {child.birthdate && (
                            <span className="text-xs text-muted-foreground">
                              DOB:{" "}
                              {new Date(child.birthdate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
