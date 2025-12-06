import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@radix-ui/react-dropdown-menu";
import { Wallet } from "lucide-react";

// ------------------------------
// Payment Step
// ------------------------------
export function PaymentStep({
  form,
  onChange,
  errors = {},
}: {
  form: any;
  onChange: any;
  errors?: Record<string, string>;
}) {
  const handleBankChange = (value) => {
    onChange({ target: { name: "bank", value } });
  };

  return (
    <Card className="mb-6 shadow-md border border-gray-200 dark:border-gray-700">
      <CardContent className="p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2 text-lg text-gray-900 dark:text-gray-100">
          <Wallet className="w-5 h-5 text-primary" />
          Payment Details
        </h3>

        {/* Bank Selection Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Wallet className="mr-2 h-4 w-4" />
              <span>{form.bank ? form.bank.toUpperCase() : "Select Bank"}</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
            <DropdownMenuLabel className="text-gray-700 dark:text-gray-300 font-medium">
              Bank
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700 my-1" />
            <DropdownMenuRadioGroup
              value={form.bank || ""}
              onValueChange={handleBankChange}
            >
              <DropdownMenuRadioItem
                className="p-2 rounded hover:bg-primary/10 dark:hover:bg-primary/20 flex items-center gap-2"
                value="cbe"
              >
                <img src="images/cbe.png" alt="CBE Bank" className="w-6 h-6" />
                <span>CBE</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                className="p-2 rounded hover:bg-primary/10 dark:hover:bg-primary/20 flex items-center gap-2"
                value="dashen"
              >
                <img
                  src="images/dashen.png"
                  alt="Dashen Bank"
                  className="w-6 h-6"
                />
                <span>Dashen Bank</span>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Registration Payment Amount */}
        <div>
          <Label className="text-gray-900 dark:text-gray-100">
            Registration Amount (ETB)
          </Label>
          <Input
            name="registrationAmount"
            type="number"
            value={form.registrationAmount}
            onChange={onChange}
            required
            className={`w-full border ${
              errors.registrationAmount ? "border-red-500" : "border-gray-300"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
            placeholder="Enter registration fee amount"
          />
          {errors.registrationAmount && (
            <p className="text-red-600 text-sm mt-1">
              {errors.registrationAmount}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
