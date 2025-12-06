export interface Payment {
  id: number;
  amount: number;
  month: string;    // "Jan", "Feb"...
  year: number;     // 2025
  childId: number;
  method: "CBE" | "Dashen Bank";
}