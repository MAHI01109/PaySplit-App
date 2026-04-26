"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGroupStore } from "@/store/groupStore";
import { useExpenseStore } from "@/store/expenseStore";
import { useSettlementStore } from "@/store/settlementStore";
import { useAuthStore } from "@/store/authStore";
import styles from "./groupDetail.module.css";
import { Button } from "@/app/components/ui/form/Button";

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: groupId } = use(params);
  
  const { groups, archiveGroup } = useGroupStore();
  const { expenses } = useExpenseStore();
  const { settlements } = useSettlementStore();
  const { user } = useAuthStore();

  const group = groups.find((g) => g.id === groupId);

  if (!user || !group) return <div className={styles.container}>Group not found</div>;

  const groupExpenses = expenses.filter((e) => e.groupId === groupId);
  const groupSettlements = settlements.filter((s) => s.groupId === groupId);

  // Combine and sort activities
  const activities = [
    ...groupExpenses.map((e) => ({ ...e, type: "EXPENSE" as const })),
    ...groupSettlements.map((s) => ({ ...s, type: "SETTLEMENT" as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleArchive = () => {
    archiveGroup(groupId, !group.archived);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.icon}>{group.icon}</div>
          <div>
            <h1 className={styles.title}>{group.name}</h1>
            {group.description && <p className={styles.description}>{group.description}</p>}
          </div>
        </div>
        <div className={styles.actions}>
          <Link href={`/groups/${groupId}/balances`}>
            <Button >Balances</Button>
          </Link>
          <Button  onClick={handleArchive}>
            {group.archived ? "Unarchive" : "Archive"}
          </Button>
        </div>
      </div>

      <div className={styles.members}>
        <h3 className={styles.sectionTitle}>Members ({group.members.length})</h3>
        <div className={styles.memberAvatars}>
          {group.members.map((m) => (
            <div
              key={m.id}
              className={styles.avatar}
              style={{ backgroundColor: m.avatarColor }}
              title={m.name}
            >
              {m.name.charAt(0)}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.activitySection}>
        <div className={styles.activityHeader}>
          <h2 className={styles.sectionTitle}>Activity Feed</h2>
          <Link href={`/groups/${groupId}/expense/new`}>
            <Button>+ Add Expense</Button>
          </Link>
        </div>

        {activities.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No activity yet.</p>
          </div>
        ) : (
          <div className={styles.feed}>
            {activities.map((activity) => {
              const isExpense = activity.type === "EXPENSE";
              const date = new Date(activity.date).toLocaleDateString();

              if (isExpense) {
                // @ts-ignore
                const exp = activity as Expense;
                const payer = group.members.find((m) => m.id === exp.paidBy)?.name || "Someone";
                
                return (
                  <Link href={`/groups/${groupId}/expense/${exp.id}`} key={`exp-${exp.id}`} className={styles.activityCard}>
                    <div className={styles.activityIcon}>💸</div>
                    <div className={styles.activityDetails}>
                      <p className={styles.activityTitle}>{exp.description}</p>
                      <p className={styles.activitySub}>{payer} paid {exp.amount} {exp.currency}</p>
                    </div>
                    <div className={styles.activityDate}>{date}</div>
                  </Link>
                );
              } else {
                // @ts-ignore
                const stl = activity as Settlement;
                const from = group.members.find((m) => m.id === stl.fromUserId)?.name || "Someone";
                const to = group.members.find((m) => m.id === stl.toUserId)?.name || "Someone";

                return (
                  <div key={`stl-${stl.id}`} className={styles.activityCard}>
                    <div className={styles.activityIcon}>🤝</div>
                    <div className={styles.activityDetails}>
                      <p className={styles.activityTitle}>Settlement</p>
                      <p className={styles.activitySub}>{from} paid {to} {stl.amount} {stl.currency}</p>
                    </div>
                    <div className={styles.activityDate}>{date}</div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
}
