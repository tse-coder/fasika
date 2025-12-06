import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Parent } from "@/types/parent.types";

// ------------------------------
// Parent Selection Step
// ------------------------------
export function ParentStep({ parents, onSelect, onAddNew }) {
  const [search, setSearch] = useState("");

  const filtered = parents.filter(
    (p: Parent) =>
      `${p.fname} ${p.lname}`.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone_number || "").includes(search)
  );

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

        <div className="border rounded-md max-h-56 overflow-y-scroll mt-2">
          {filtered.length > 0 ? (
            filtered.map((parent) => (
              <div
                key={parent.id}
                onClick={() => onSelect(parent.id)}
                className="p-3 cursor-pointer hover:bg-primary/10 border-b"
              >
                <div className="font-medium">
                  {parent.fname} {parent.lname}
                </div>
                <div className="text-sm text-muted-foreground">
                  {parent.email} &#9679; {parent.phone_number}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground p-3">
              No matching parents found.
            </p>
          )}
        </div>

        <Button onClick={onAddNew} variant="outline" className="w-full mt-2">
          Add New Parent
        </Button>
      </CardContent>
    </Card>
  );
}
