"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navigation.module.css";
import { useAuthStore } from "@/store/authStore";

export function Navigation() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuthStore();
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (currentY <= 64) {
        setIsHidden(false);
      } else if (delta > 8) {
        setIsHidden(true);
      } else if (delta < -8) {
        setIsHidden(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!isLoggedIn) return null;

  const tabs = [
    { label: "Dashboard", path: "/dashboard", icon: "🏠" },
    { label: "Groups", path: "/groups", icon: "👥" },
    { label: "Analytics", path: "/analytics", icon: "📈" },
    { label: "Profile", path: "/profile", icon: "👤" },
  ]
  

  return (
    <nav className={`${styles.nav} ${isHidden ? styles.hidden : ""}`}>
      <ul className={styles.navList}>
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.path);
          return (
            <li key={tab.path} className={styles.navItem}>
              <Link
                href={tab.path}
                className={`${styles.navLink} ${isActive ? styles.active : ""}`}
              >
                <span className={styles.icon}>{tab.icon}</span>
                <span className={styles.label}>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
