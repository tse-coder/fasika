import { Card, CardHeader, CardTitle,CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
interface MonthQuartInfoTableProps {
    programs: string[];
    local: {
        recurring: { program: string; branch: string; amount: number; discountPercent: number }[];
    };
    currentBranch: string;
    handleRecurringChange: (
        program: string,
        field: "amount" | "discountPercent",
        value: number
    ) => void;
    formatProgram: (program: string) => string;

}

function MonthQuartInfoTable({
  programs,
  local,
  currentBranch,
  handleRecurringChange,
  formatProgram
}: MonthQuartInfoTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {currentBranch === "pre school summit" ? "Quarterly" : "Monthly"} Fees
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Program</TableHead>
              <TableHead>
                {currentBranch === "pre school summit" ? "Quarterly" : "Monthly"} Amount
              </TableHead>
              <TableHead>Discount (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {programs.map((program) => {
              const row = local.recurring.find(
                (r) => r.program === program && r.branch === currentBranch
              ) || {
                amount: 0,
                discountPercent: 0,
              };
              return (
                <TableRow key={program}>
                  <TableCell className="font-medium">
                    {formatProgram(program)}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.amount}
                      onChange={(e) =>
                        handleRecurringChange(
                          program,
                          "amount",
                          Number(e.target.value || 0)
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.discountPercent}
                      onChange={(e) =>
                        handleRecurringChange(
                          program,
                          "discountPercent",
                          Number(e.target.value || 0)
                        )
                      }
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default MonthQuartInfoTable;
