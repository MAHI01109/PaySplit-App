"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useGroupStore } from "@/store/groupStore";
import styles from "./NotificationPanel.module.css";
import { Button } from "@/app/components/ui/form/Button";

export function NotificationPanel() {
  const { isLoggedIn } = useAuthStore();
  const { groups } = useGroupStore();
  const [isOpen, setIsOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState(
    typeof Notification !== "undefined" && Notification.permission === "granted"
  );

  useEffect(() => {
    if (!isLoggedIn || typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || typeof Notification === "undefined") return;

    if (Notification.permission === "granted") {
      setTimeout(() => {
        setHasPermission(true);
      }, 0);
      return;
    }

    if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        setTimeout(() => {
          setHasPermission(permission === "granted");
        }, 0);
      });
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) return null;

  const showAppNotification = async (title: string, body: string, redirectUrl: string) => {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      icon: "/favicon.ico",
      data: { url: redirectUrl },
    });
  };

  const simulateNewExpense = async () => {
    if (!hasPermission) {
      alert("Notification permission not granted");
      return;
    }
    
    // Pick a random group or the first one
    const group = groups[0];
    if (!group) {
      alert("Create a group first to simulate this notification.");
      return;
    }

    await showAppNotification(
      `New Expense in ${group.name}`,
      "Alice added a new expense: Dinner (500 INR)",
      `/groups/${group.id}`
    );
  };

  const simulateSettlement = async () => {
    if (!hasPermission) {
      alert("Notification permission not granted");
      return;
    }

    const group = groups[0];
    if (!group) {
      alert("Create a group first to simulate this notification.");
      return;
    }

    await showAppNotification(
      "Settlement Received!",
      `Bob paid you 200 INR in ${group.name}`,
      `/groups/${group.id}/balances`
    );
  };

  return (
    <div className={styles.container}>
      <button 
        className={styles.fab} 
        onClick={() => setIsOpen(!isOpen)}
        title="Simulate Notifications"
      >
        🔔
      </button>

      {isOpen && (
        <div className={styles.panel}>
          <h4>Simulate Notifications</h4>
          <p className={styles.hint}>Triggers native web notifications.</p>
          <div className={styles.actions}>
            <Button fullWidth onClick={simulateNewExpense}>New Expense</Button>
            <Button fullWidth onClick={simulateSettlement}>New Settlement</Button>
          </div>
        </div>
      )}
    </div>
  );
}
