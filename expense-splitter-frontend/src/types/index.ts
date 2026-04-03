export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role?: UserRole;
  isFake?: boolean;
}

export interface ExpenseSplit {
  userId: string;
  userName?: string;
  email?: string;
  share: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidByUserId: string;
  paidByName?: string;
  paidByEmail?: string;
  splits: ExpenseSplit[];
  createdAt: string;
}

/** Positive = they owe you; negative = you owe them (match your API if different). */
export interface BalanceEntry {
  userId: string;
  name: string;
  email: string;
  netBalance: number;
}

export interface BalanceSummary {
  entries: BalanceEntry[];
  /** Your running total: what you're owed minus what you owe. */
  yourTotalBalance: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AdminStats {
  totalUsers: number;
  totalExpenses: number;
  totalAmountRecorded: number;
}
