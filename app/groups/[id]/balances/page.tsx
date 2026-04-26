"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useGroupStore } from "@/store/groupStore";
import { useExpenseStore } from "@/store/expenseStore";
import { useSettlementStore } from "@/store/settlementStore";
import { useAuthStore } from "@/store/authStore";
import { simplifyDebts, Debt } from "@/lib/debtAlgorithm";
import { Button } from "@/app/components/ui/form/Button";
import styles from "./balances.module.css";

export default function BalancesPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: groupId } = use(params);

  const { groups } = useGroupStore();
  const { expenses } = useExpenseStore();
  const { settlements, addSettlement } = useSettlementStore();
  const { user } = useAuthStore();

  const [settleAmount, setSettleAmount] = useState<number | "">("");
  const [activeDebt, setActiveDebt] = useState<Debt | null>(null);
  const [memberA, setMemberA] = useState("");
  const [memberB, setMemberB] = useState("");

  const group = groups.find((g) => g.id === groupId);

  if (!user || !group) return <div className={styles.container}>Loading...</div>;

  const groupExpenses = expenses.filter((e) => e.groupId === groupId);
  const groupSettlements = settlements.filter((s) => s.groupId === groupId);

  // Reconstruct all debts from expenses and settlements
  const allTransactions: Debt[] = [];

  // Add expenses
  groupExpenses.forEach((exp) => {
    exp.splits.forEach((split) => {
      if (split.userId !== exp.paidBy && split.amount > 0) {
        // Person owes the payer
        allTransactions.push({
          from: split.userId,
          to: exp.paidBy,
          amount: split.amount,
        });
      }
    });
  });

  // Subtract settlements (treat them as reverse debts)
  groupSettlements.forEach((stl) => {
    allTransactions.push({
      from: stl.toUserId,
      to: stl.fromUserId,
      amount: stl.amount,
    });
  });

  const simplifiedDebts = simplifyDebts(allTransactions);
  const filteredSettlements = groupSettlements.filter((settlement) => {
    if (!memberA || !memberB) return true;

    return (
      (settlement.fromUserId === memberA && settlement.toUserId === memberB) ||
      (settlement.fromUserId === memberB && settlement.toUserId === memberA)
    );
  });

  const handleSettle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDebt || typeof settleAmount !== "number" || settleAmount <= 0) return;

    addSettlement({
      id: crypto.randomUUID(),
      groupId,
      fromUserId: activeDebt.from,
      toUserId: activeDebt.to,
      amount: settleAmount,
      currency: "INR", // Simplified: assuming a single currency for the group or user's default
      date: new Date().toISOString(),
    });

    setActiveDebt(null);
    setSettleAmount("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Balances</h1>
        <Button onClick={() => router.back()}>Back to Group</Button>
      </div>

      <div className={styles.content}>
        {simplifiedDebts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.icon}>🎉</div>
            <p>All debts are settled up!</p>
          </div>
        ) : (
          <div className={styles.debtsList}>
            {simplifiedDebts.map((debt, idx) => {
              const fromUser = group.members.find((m) => m.id === debt.from);
              const toUser = group.members.find((m) => m.id === debt.to);

              if (!fromUser || !toUser) return null;

              return (
                <div key={idx} className={styles.debtCard}>
                  <div className={styles.debtInfo}>
                    <div className={styles.avatar} style={{ backgroundColor: fromUser.avatarColor }}>
                      {fromUser.name.charAt(0)}
                    </div>
                    <span className={styles.owesText}>
                      <strong>{fromUser.id === user.id ? "You" : fromUser.name}</strong> owes{" "}
                      <strong>{toUser.id === user.id ? "You" : toUser.name}</strong>
                    </span>
                    <div className={styles.avatar} style={{ backgroundColor: toUser.avatarColor }}>
                      {toUser.name.charAt(0)}
                    </div>
                  </div>
                  <div className={styles.debtAmount}>
                    {debt.amount.toFixed(2)}
                  </div>
                  <Button 
                    onClick={() => {
                      setActiveDebt(debt);
                      setSettleAmount(debt.amount);
                    }}
                  >
                    Settle
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {activeDebt && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Record Settlement</h3>
            <form onSubmit={handleSettle}>
              <div className={styles.formGroup}>
                <label>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className={styles.input}
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(parseFloat(e.target.value))}
                  max={activeDebt.amount}
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <Button type="button"  onClick={() => setActiveDebt(null)}>Cancel</Button>
                <Button type="submit">Record Payment</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.historySection}>
        <h2 className={styles.sectionTitle}>Settlement History</h2>
        <div className={styles.filtersRow}>
          <select
            value={memberA}
            onChange={(e) => setMemberA(e.target.value)}
            className={styles.input}
          >
            <option value="">Member A (all)</option>
            {group.members.map((member) => (
              <option key={`a-${member.id}`} value={member.id}>
                {member.id === user.id ? "You" : member.name}
              </option>
            ))}
          </select>
          <select
          
            value={memberB}
            onChange={(e) => setMemberB(e.target.value)}
            className={styles.input}
          >
            <option value="">Member B (all)</option>
            {group.members
              .filter((member) => member.id !== memberA)
              .map((member) => (
                <option key={`b-${member.id}`} value={member.id}>
                  {member.id === user.id ? "You" : member.name}
                </option>
              ))}
          </select>
        </div>

        {filteredSettlements.length === 0 ? (
          <p className={styles.emptyHistory}>No settlements found for selected members.</p>
        ) : (
          <div className={styles.historyList}>
            {filteredSettlements
              .slice()
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((settlement) => {
                const from = group.members.find((m) => m.id === settlement.fromUserId);
                const to = group.members.find((m) => m.id === settlement.toUserId);

                if (!from || !to) return null;

                return (
                  <div key={settlement.id} className={styles.historyItem}>
                    <span>
                      <strong>{from.id === user.id ? "You" : from.name}</strong> paid{" "}
                      <strong>{to.id === user.id ? "You" : to.name}</strong>
                    </span>
                    <span>
                      {settlement.amount.toFixed(2)} {settlement.currency}
                    </span>
                    <span className={styles.historyDate}>
                      {new Date(settlement.date).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
