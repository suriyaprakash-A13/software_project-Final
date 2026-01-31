// backend/src/settlements/algorithms/optimize-settlements.ts

export interface NetBalance {
  userId: string;
  userName: string;
  amount: number; // Positive = creditor, Negative = debtor
}

export interface SettlementTransaction {
  from: {
    id: string;
    name: string;
  };
  to: {
    id: string;
    name: string;
  };
  amount: string; // Formatted as decimal string
}

/**
 * Optimizes settlement transactions using a greedy heap-based algorithm
 * Time Complexity: O(n log n) where n is the number of users with non-zero balance
 * Space Complexity: O(n)
 *
 * @param netBalances - Array of user net balances
 * @returns Array of optimized settlement transactions
 */
export function optimizeSettlements(
  netBalances: NetBalance[],
): SettlementTransaction[] {
  // Filter out zero balances (already settled)
  const EPSILON = 0.01; // Ignore rounding errors below 1 cent

  const creditors = netBalances
    .filter((balance) => balance.amount > EPSILON)
    .map((balance) => ({ ...balance })) // Clone to avoid mutation
    .sort((a, b) => b.amount - a.amount); // Max-heap simulation

  const debtors = netBalances
    .filter((balance) => balance.amount < -EPSILON)
    .map((balance) => ({
      ...balance,
      amount: Math.abs(balance.amount), // Convert to positive for easier logic
    }))
    .sort((a, b) => b.amount - a.amount); // Max-heap simulation

  const settlements: SettlementTransaction[] = [];

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    // Settle the minimum amount
    const settlementAmount = Math.min(creditor.amount, debtor.amount);

    settlements.push({
      from: {
        id: debtor.userId,
        name: debtor.userName,
      },
      to: {
        id: creditor.userId,
        name: creditor.userName,
      },
      amount: settlementAmount.toFixed(2),
    });

    // Update remaining balances
    creditor.amount -= settlementAmount;
    debtor.amount -= settlementAmount;

    // Move to next creditor if current one is fully paid
    if (creditor.amount < EPSILON) {
      creditorIndex++;
    }

    // Move to next debtor if current one is fully settled
    if (debtor.amount < EPSILON) {
      debtorIndex++;
    }
  }

  return settlements;
}

/**
 * Calculates net balance for each user in a group
 *
 * @param expenses - Array of expense records
 * @param members - Array of group members
 * @returns Array of net balances for each user
 */
export function calculateNetBalances(
  expenses: Array<{
    id: string;
    amount: number;
    payerId: string;
  }>,
  members: Array<{
    userId: string;
    user: {
      id: string;
      name: string;
    };
  }>,
): NetBalance[] {
  const memberCount = members.length;

  if (memberCount === 0) {
    return [];
  }

  // Initialize balances for all members
  const balances: Map<string, { name: string; amount: number }> = new Map();

  members.forEach((member) => {
    balances.set(member.userId, {
      name: member.user.name,
      amount: 0,
    });
  });

  // Calculate net balances
  expenses.forEach((expense) => {
    const perPersonShare = expense.amount / memberCount;

    // Credit the payer
    const payer = balances.get(expense.payerId);
    if (payer) {
      payer.amount += expense.amount;
    }

    // Debit all members equally (including the payer)
    members.forEach((member) => {
      const memberBalance = balances.get(member.userId);
      if (memberBalance) {
        memberBalance.amount -= perPersonShare;
      }
    });
  });

  // Convert to array format
  return Array.from(balances.entries()).map(([userId, data]) => ({
    userId,
    userName: data.name,
    amount: data.amount,
  }));
}

/**
 * Main function that combines balance calculation and settlement optimization
 */
export function generateSettlementPlan(
  expenses: Array<{
    id: string;
    amount: number;
    payerId: string;
  }>,
  members: Array<{
    userId: string;
    user: {
      id: string;
      name: string;
    };
  }>,
) {
  const netBalances = calculateNetBalances(expenses, members);
  const settlements = optimizeSettlements(netBalances);

  // Calculate additional statistics
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return {
    netBalances,
    settlements,
    transactionCount: settlements.length,
    totalExpenses: totalExpenses.toFixed(2),
  };
}
