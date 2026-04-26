import { simplifyDebts, Debt } from "./debtAlgorithm";

describe("simplifyDebts", () => {
  it("should handle circular debts correctly", () => {
    const transactions: Debt[] = [
      { from: "A", to: "B", amount: 100 },
      { from: "B", to: "C", amount: 100 },
      { from: "C", to: "A", amount: 100 },
    ];

    const simplified = simplifyDebts(transactions);
    
    // In a perfect circle of equal amounts, no one owes anything
    expect(simplified.length).toBe(0);
  });

  it("should simplify a chain of debts", () => {
    const transactions: Debt[] = [
      { from: "A", to: "B", amount: 200 },
      { from: "B", to: "C", amount: 200 },
    ];

    const simplified = simplifyDebts(transactions);
    
    // A should just pay C 200 directly
    expect(simplified.length).toBe(1);
    expect(simplified[0]).toEqual({ from: "A", to: "C", amount: 200 });
  });

  it("should handle multiple people owing one person", () => {
    const transactions: Debt[] = [
      { from: "A", to: "C", amount: 50 },
      { from: "B", to: "C", amount: 50 },
    ];

    const simplified = simplifyDebts(transactions);
    
    // No simplification possible here, A and B both pay C 50
    expect(simplified.length).toBe(2);
    // Sort to make test deterministic
    const sorted = [...simplified].sort((a, b) => a.from.localeCompare(b.from));
    expect(sorted[0]).toEqual({ from: "A", to: "C", amount: 50 });
    expect(sorted[1]).toEqual({ from: "B", to: "C", amount: 50 });
  });

  it("should handle complex scenarios and minimize transactions", () => {
    const transactions: Debt[] = [
      { from: "A", to: "B", amount: 10 },
      { from: "B", to: "C", amount: 20 },
      { from: "C", to: "D", amount: 15 },
      { from: "D", to: "A", amount: 5 },
    ];
    // Net Balances:
    // A: -10 + 5 = -5
    // B: 10 - 20 = -10
    // C: 20 - 15 = 5
    // D: 15 - 5 = 10
    // Debtors: B (10), A (5)
    // Creditors: D (10), C (5)

    const simplified = simplifyDebts(transactions);

    // B should pay D 10, A should pay C 5
    expect(simplified.length).toBe(2);
    
    const bPaysD = simplified.find(s => s.from === "B" && s.to === "D");
    const aPaysC = simplified.find(s => s.from === "A" && s.to === "C");
    
    expect(bPaysD?.amount).toBe(10);
    expect(aPaysC?.amount).toBe(5);
  });
});
