export interface PaymentInfoData {
  registration: Array<{ program: string; newFee: number; oldFee: number }>;
  recurring: Array<{
    program: string;
    branch: string;
    schedule: "monthly" | "quarterly";
    amount: number;
    discountPercent: number;
  }>;
  discounted: Array<{
    childId: number;
    childName: string;
    branch: string;
    program: string;
    discountPercent: number;
    note: string;
  }>;
}
