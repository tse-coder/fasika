import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React from "react";
interface RegInfoTableProps {
    programs: string[];
    local: {
        registration: { program: string; newFee: number; oldFee: number }[];
    };
    handleRegistrationChange: (
        program: string,
        field: "newFee" | "oldFee",
        value: number
    ) => void;
    formatProgram: (program: string) => string;

}
function RegisterationInfoTable({ programs, local, handleRegistrationChange, formatProgram }: RegInfoTableProps) {
  return (
    <Card className="p-0">
      <CardHeader>
        <CardTitle>Registration Fees</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Program</TableHead>
              <TableHead>New Registration (ETB)</TableHead>
              <TableHead>Old Registration (ETB)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {programs.map((program) => {
              const row = local.registration.find(
                (r) => r.program === program
              ) || { newFee: 0, oldFee: 0 };
              return (
                <TableRow key={program}>
                  <TableCell className="font-medium">
                    {formatProgram(program)}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.newFee}
                      onChange={(e) =>
                        handleRegistrationChange(
                          program,
                          "newFee",
                          Number(e.target.value || 0)
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.oldFee}
                      onChange={(e) =>
                        handleRegistrationChange(
                          program,
                          "oldFee",
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

export default RegisterationInfoTable;
