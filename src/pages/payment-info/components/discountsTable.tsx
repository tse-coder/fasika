import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DiscountsTableProps {
  search: string;
  setSearch: (value: string) => void;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  pageSize: number;
  paginatedDiscounts: {
    childId: number;
    childName: string;
    program: string;
    branch: string;
    discountPercent: number;
    note: string;
  }[];
  setSelectedNote: (note: string | null) => void;
  selectedNote: string | null;
  discountedFiltered: {
    childId: number;
    childName: string;
    program: string;
    branch: string;
    discountPercent: number;
    note: string;
  }[];
  formatProgram: (p: string) => string;
}

function DiscountsTable({
  search,
  setSearch,
  page,
  setPage,
  pageSize,
  paginatedDiscounts,
  discountedFiltered,
  setSelectedNote,
  selectedNote,
  formatProgram,
}: DiscountsTableProps) {
  return (
    <Card className="p-0">
      <CardHeader>
        <CardTitle>Discounted Payments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search child..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Child</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Discount (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDiscounts.map((row) => (
              <TableRow
                key={`${row.childId}-${row.branch}`}
                className="cursor-pointer hover:bg-muted/40"
                onClick={() => setSelectedNote(row.note)}
              >
                <TableCell className="font-medium">{row.childName}</TableCell>
                <TableCell>{formatProgram(row.program)}</TableCell>
                <TableCell>{row.branch}</TableCell>
                <TableCell>{row.discountPercent}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {paginatedDiscounts.length} of {discountedFiltered.length}
          </span>
          <div className="space-x-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page * pageSize >= discountedFiltered.length}
              onClick={() =>
                setPage((p) =>
                  p * pageSize >= discountedFiltered.length ? p : p + 1
                )
              }
            >
              Next
            </Button>
          </div>
        </div>
        {selectedNote && (
          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="font-semibold">Note</p>
            <p>{selectedNote}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DiscountsTable;
