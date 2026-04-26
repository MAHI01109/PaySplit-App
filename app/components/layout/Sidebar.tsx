"use client";

import Link from "next/link";
import styles from "./layout.module.css"

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.logo}>PaySplit</h2>
      <nav className={styles.nav}>
        <Link href="/dashboard" className={styles.navLink}>Dashboard</Link>
        <Link href="/dashboard/groups" className={styles.navLink}>Groups</Link>
        <Link href="/dashboard/profile" className={styles.navLink}>Profile</Link>
        <Link href="/dashboard/analytics" className={styles.navLink}>Analytics</Link>
      </nav>
    </aside>
  )
}
