import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LoaderIcon } from "@/components/ui/skeleton-card";
import type { Parent, ParentOutput } from "@/types/parent.types";

// ------------------------------
// Parent Selection Step
// ------------------------------
export function ParentStep({
  parents,
  onSelect,
  onAddNew,
  onNext,
  onSearch,
  isLoading,
}: any) {
  const [search, setSearch] = useState("");
  const timer = useRef<number | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const fetchingRef = useRef(false);
  const [localLoading, setLocalLoading] = useState(false);

  // Local filtering for quick UX while server responds
  const filtered = (parents || []).filter(
    (p: ParentOutput) =>
      `${p.fname} ${p.lname}`.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone || "").includes(search)
  );

  // Debounce search input and call onSearch when user stops typing
  useEffect(() => {
    if (!onSearch) return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      try {
        onSearch(search.trim());
      } catch (e) {
        console.error("Search failed:", e);
      }
    }, 500);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [search, onSearch]);

  // Keep fetchingRef in sync with isLoading prop so we don't duplicate calls
  useEffect(() => {
    fetchingRef.current = Boolean(isLoading);
    // when server loading finishes, reset localLoading
    if (!isLoading) setLocalLoading(false);
  }, [isLoading]);

  // Scroll handler: when near bottom, trigger onNext (infinite scroll)
  const handleScroll = () => {
    if (!onNext || fetchingRef.current) return;
    const el = listRef.current;
    if (!el) return;
    const threshold = 120; // px from bottom
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= threshold) {
      // mark local loading immediately so loader shows
      setLocalLoading(true);
      fetchingRef.current = true;
      try {
        onNext();
      } catch (e) {
        // swallow
        fetchingRef.current = false;
        setLocalLoading(false);
      }
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-primary" />
          Select Parent / Guardian
        </h3>

        <Input
          placeholder="Search parent by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div
          className="border rounded-md max-h-56 overflow-y-auto mt-2"
          ref={listRef}
          onScroll={handleScroll}
        >
          {(isLoading || localLoading) && (parents || []).length === 0 ? (
            <div className="p-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse mb-3">
                  <div className="h-4 bg-muted/40 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted/30 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <>
              {filtered.map((parent) => (
                <div
                  key={parent.id}
                  onClick={() => onSelect(parent.id)}
                  className="p-3 cursor-pointer hover:bg-primary/10 border-b"
                >
                  <div className="font-medium">
                    {parent.fname} {parent.lname}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {parent.email} - {parent.phone}
                  </div>
                </div>
              ))}

              {/* Loader */}
              {onNext &&
                (isLoading ||
                  (localLoading && <LoaderIcon className="w-4 h-4" />))}
            </>
          ) : (
            <p className="text-sm text-muted-foreground p-3">
              No matching parents found.
            </p>
          )}
        </div>

        <div className="flex gap-2 mt-2">
          <Button onClick={onAddNew} variant="outline" className="flex-1">
            Add New Parent
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
