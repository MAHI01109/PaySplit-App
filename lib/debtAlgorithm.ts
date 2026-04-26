export type Debt = {
  from: string;
  to: string;
  amount: number;
};

export function simplifyDebts(transactions: Debt[]): Debt[] {
  const balances: Record<string, number> = {};

  // 1. Calculate net balances for each person
  for (const { from, to, amount } of transactions) {
    if (!balances[from]) balances[from] = 0;
    if (!balances[to]) balances[to] = 0;

    balances[from] -= amount; // from owes money
    balances[to] += amount;   // to is owed money
  }

  // 2. Separate into debtors and creditors
  const debtors: { id: string; amount: number }[] = [];
  const creditors: { id: string; amount: number }[] = [];

  for (const [id, balance] of Object.entries(balances)) {
    if (balance < -0.01) {
      debtors.push({ id, amount: Math.abs(balance) });
    } else if (balance > 0.01) {
      creditors.push({ id, amount: balance });
    }
  }

  // Sort them so larger amounts match first (heuristic for fewer transactions)
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const result: Debt[] = [];

  let i = 0; // debtor index
  let j = 0; // creditor index

  // 3. Settle debts
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0.01) {
      result.push({
        from: debtor.id,
        to: creditor.id,
        amount: parseFloat(amount.toFixed(2)),
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount <= 0.01) i++;
    if (creditor.amount <= 0.01) j++;
  }

  return result;
}
