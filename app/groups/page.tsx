"use client";

import Link from "next/link";
import { useGroupStore } from "@/store/groupStore";
import { useExpenseStore } from "@/store/expenseStore";
import { useAuthStore } from "@/store/authStore";
import { useSettlementStore } from "@/store/settlementStore";
import styles from "./groups.module.css";
import { Button } from "@/app/components/ui/form/Button";

export default function GroupsPage() {
  const { groups } = useGroupStore();
  const { expenses } = useExpenseStore();
  const { settlements } = useSettlementStore();
  const { user } = useAuthStore();

  if (!user) return null;

  const activeGroups = groups.filter((g) => !g.archived);

  // Group cards calculation
  const getGroupStats = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    const groupExpenses = expenses.filter((e) => e.groupId === groupId);
    const groupSettlements = settlements.filter((s) => s.groupId === groupId);
    const totalSpend = groupExpenses.reduce((acc, curr) => acc + curr.amount, 0);

    // Calculate net balance for current user
    let netBalance = 0;
    
    groupExpenses.forEach((expense) => {
      // Amount user paid
      if (expense.paidBy === user.id) {
        netBalance += expense.amount;
      }
      // Amount user owes based on splits
      const userSplit = expense.splits.find((s) => s.userId === user.id);
      if (userSplit) {
        netBalance -= userSplit.amount;
      }
    });

    const latestExpenseTs = groupExpenses.length
      ? Math.max(...groupExpenses.map((e) => new Date(e.date).getTime()))
      : 0;
    const latestSettlementTs = groupSettlements.length
      ? Math.max(...groupSettlements.map((s) => new Date(s.date).getTime()))
      : 0;
    const groupUpdatedTs = group ? new Date(group.updatedAt).getTime() : 0;
    const lastActivityTs = Math.max(latestExpenseTs, latestSettlementTs, groupUpdatedTs);

    return { totalSpend, netBalance, lastActivityTs };
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Your Groups</h1>
        <Link href="/groups/new">
          <Button>+ New Group</Button>
        </Link>
      </div>

      {activeGroups.length === 0 ? (
        <div className={styles.emptyState}>
          <p>You don't have any active groups yet.</p>
          <Link href="/groups/new">
            <Button variant="outline">Create your first group</Button>
          </Link>
        </div>
      ) : (
        <div className={styles.groupList}>
          {activeGroups.map((group) => {
            const { totalSpend, netBalance, lastActivityTs } = getGroupStats(group.id);
            const balanceClass = netBalance > 0 ? styles.positiveBalance : netBalance < 0 ? styles.negativeBalance : "";
            const balanceText = netBalance > 0 ? "You are owed" : netBalance < 0 ? "You owe" : "Settled up";

            return (
              <Link href={`/groups/${group.id}`} key={group.id} className={styles.groupCard}>
                <div className={styles.groupIcon}>{group.icon}</div>
                <div className={styles.groupInfo}>
                  <h3 className={styles.groupName}>{group.name}</h3>
                  <p className={styles.groupActivity}>
                    Last active: {new Date(lastActivityTs).toLocaleDateString()}
                  </p>
                </div>
                <div className={styles.groupFinancials}>
                  <p className={styles.totalSpend}>Total: {totalSpend.toFixed(2)} {user.currency}</p>
                  <p className={`${styles.netBalance} ${balanceClass}`}>
                    {balanceText} {Math.abs(netBalance).toFixed(2)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
