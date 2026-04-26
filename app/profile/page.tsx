 "use client";

import { useState } from "react";
import styles from "./profile.module.css";
import { Button } from "@/app/components/ui/form/Button";
import { useAuthStore } from "@/store/authStore";
import { useGroupStore } from "@/store/groupStore";
import { useExpenseStore } from "@/store/expenseStore";
import { useSettlementStore } from "@/store/settlementStore";
import { avatarColors } from "@/constants/avatarColors";

export default function Profile() {
  const { user, setUser, logout } = useAuthStore();
  const { groups } = useGroupStore();
  const { expenses } = useExpenseStore();
  const { settlements } = useSettlementStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || "",
    currency: user?.currency || "INR",
    avatarColor: user?.avatarColor || avatarColors[0],
  });

  if (!user) return null;

  // Stats computation
  const activeGroupsCount = groups.filter((g) => !g.archived).length;

  const totalPaid = expenses
    .filter((e) => e.paidBy === user.id)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalSettled = settlements
    .filter((s) => s.fromUserId === user.id)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleSave = () => {
    setUser({
      ...user,
      name: editData.name,
      currency: editData.currency as "USD" | "EUR" | "INR",
      avatarColor: editData.avatarColor,
    });
    setIsEditing(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Profile</h1>
      
      <div className={styles.profileCard}>
        <div className={styles.header}>
          <div
            className={styles.avatar}
            style={{ backgroundColor: user.avatarColor }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          {!isEditing ? (
            <div className={styles.info}>
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <p className={styles.currencyBadge}>{user.currency}</p>
            </div>
          ) : (
            <div className={styles.editForm}>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className={styles.input}
              />
              <select
                value={editData.currency}
                onChange={(e) => setEditData({ ...editData, currency: e.target.value })}
                className={styles.select}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
              <div className={styles.colorPicker}>
                {avatarColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Select avatar color ${color}`}
                    onClick={() => setEditData({ ...editData, avatarColor: color })}
                    className={`${styles.colorCircle} ${
                      editData.avatarColor === color ? styles.activeColor : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          {isEditing ? (
            <Button onClick={handleSave}>Save</Button>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>
      </div>

      <h2 className={styles.statsTitle}>Lifetime Stats</h2>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Active Groups</p>
          <p className={styles.statValue}>{activeGroupsCount}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Paid</p>
          <p className={styles.statValue}>
            {totalPaid} {user.currency}
          </p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Settled</p>
          <p className={styles.statValue}>
            {totalSettled} {user.currency}
          </p>
        </div>
      </div>

      <div className={styles.logoutWrapper}>
        <Button onClick={logout} className={styles.logoutBtn}>
          Logout
        </Button>
      </div>
    </div>
  );
}