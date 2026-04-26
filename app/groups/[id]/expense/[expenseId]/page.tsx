"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGroupStore } from "@/store/groupStore";
import { useExpenseStore } from "@/store/expenseStore";
import { useAuthStore } from "@/store/authStore";
import { useCurrencyStore } from "@/store/currencyStore";
import { Button } from "@/app/components/ui/form/Button";
import styles from "./expenseDetail.module.css";

export default function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string; expenseId: string }>;
}) {
  const router = useRouter();
  const { id: groupId, expenseId } = use(params);

  const { groups } = useGroupStore();
  const { expenses, deleteExpense } = useExpenseStore();
  const { user } = useAuthStore();
  const { getRate } = useCurrencyStore();

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const group = groups.find((g) => g.id === groupId);
  const expense = expenses.find((e) => e.id === expenseId);

  if (!user || !group || !expense) return <div className={styles.container}>Expense not found</div>;

  const payer = group.members.find((m) => m.id === expense.paidBy);

  const getExpenseRate = (toCurrency: string) => {
    if (expense.currency === toCurrency) return 1;

    if (expense.historicalRates) {
      const directRate = expense.historicalRates[toCurrency];
      if (typeof directRate === "number") return directRate;

      const inverseRate = expense.historicalRates[expense.currency];
      if (typeof inverseRate === "number" && inverseRate !== 0) return 1 / inverseRate;
    }

    return getRate(expense.currency, toCurrency);
  };

  // Calculate converted amount if currency differs
  const displayCurrency = user.currency;
  const originalCurrency = expense.currency;
  let convertedAmount = expense.amount;
  if (originalCurrency !== displayCurrency) {
      const rate = getExpenseRate(displayCurrency);
      convertedAmount = expense.amount * rate;
    }

  const handleDelete = () => {
    deleteExpense(expense.id, "User deleted expense");
    router.push(`/groups/${groupId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{expense.description}</h1>
          <p className={styles.subtitle}>
            Paid by <strong>{payer?.id === user.id ? "You" : payer?.name}</strong> on {new Date(expense.date).toLocaleDateString()}
          </p>
        </div>
        <div className={styles.amountSection}>
          <p className={styles.mainAmount}>
            {convertedAmount.toFixed(2)} {displayCurrency}
          </p>
          {originalCurrency !== displayCurrency && (
            <p className={styles.originalAmount}>
              Original: {expense.amount.toFixed(2)} {originalCurrency}
            </p>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <Link href={`/groups/${groupId}/expense/${expense.id}/edit`}>
          <Button variant="outline">Edit</Button>
        </Link>
        <Button variant="outline" onClick={() => setShowConfirmDelete(true)} className={styles.deleteBtn}>
          Delete
        </Button>
      </div>

      {showConfirmDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this expense? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <Button variant="outline" onClick={() => setShowConfirmDelete(false)}>Cancel</Button>
              <Button onClick={handleDelete} className={styles.deleteBtn}>Yes, Delete</Button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Split Breakdown ({expense.splitType})</h2>
        <div className={styles.splitList}>
          {expense.splits.map((split) => {
            const member = group.members.find((m) => m.id === split.userId);
            if (!member) return null;

            let splitConverted = split.amount;
            if (originalCurrency !== displayCurrency) {
                splitConverted = split.amount * getExpenseRate(displayCurrency);
              }

            return (
              <div key={member.id} className={styles.splitRow}>
                <div className={styles.splitUser}>
                  <div className={styles.avatar} style={{ backgroundColor: member.avatarColor }}>
                    {member.name.charAt(0)}
                  </div>
                  <span>{member.id === user.id ? "You" : member.name}</span>
                </div>
                <div className={styles.splitAmount}>
                  {splitConverted.toFixed(2)} {displayCurrency}
                  {split.percentage && <span className={styles.splitMeta}>({split.percentage}%)</span>}
                  {split.share && <span className={styles.splitMeta}>({split.share} shares)</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {expense.location && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Location</h2>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${expense.location.lat},${expense.location.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.locationLink}
          >
            📍 {expense.location.display_name}
          </a>
        </div>
      )}

      {expense.image && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Receipt</h2>
          <div className={styles.receiptContainer}>
            <img src={expense.image} alt="Receipt" />
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Audit Log</h2>
        <ul className={styles.auditLog}>
          {expense.auditLog.map((log, idx) => (
            <li key={idx}>
              <span className={styles.logDate}>{new Date(log.timestamp).toLocaleString()}</span>
              <span className={styles.logAction}>{log.action}</span>
              <span className={styles.logDetails}>{log.details}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
