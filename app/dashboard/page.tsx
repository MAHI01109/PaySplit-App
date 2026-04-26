"use client";

import Link from "next/link";
import { useGroupStore } from "@/store/groupStore";
import { useExpenseStore } from "@/store/expenseStore";
import { useAuthStore } from "@/store/authStore";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { groups } = useGroupStore();
  const { expenses } = useExpenseStore();

  if (!user) return null;

  const activeGroups = groups.filter((group) => !group.archived).length;
  const userExpenses = expenses.filter((expense) => expense.paidBy === user.id).length;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome back, {user.name.split(" ")[0]}</h1>
      <p className={styles.subtitle}>Here is your PaySplit snapshot.</p>

      <div className={styles.statsGrid}>
        <div className={styles.card}>
          <p className={styles.label}>Active Groups</p>
          <p className={styles.value}>{activeGroups}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.label}>Expenses You Paid</p>
          <p className={styles.value}>{userExpenses}</p>
        </div>
      </div>

      <div className={styles.links}>
        <Link href="/groups" className={styles.linkCard}>
          Go to Groups
        </Link>
        <Link href="/analytics" className={styles.linkCard}>
          Go to Analytics
        </Link>
      </div>
    </div>
  );
}
