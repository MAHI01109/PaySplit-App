"use client";

import styles from "./layout.module.css"
import { useAuthStore } from '@/store/authStore'


export default function Navbar() {
    const user = useAuthStore((state) => state.user);
    return (
        <header className={styles.navbar}>
            <h3>Welcome ,{user?.name}</h3>
            <div className={styles.avatar} style={{ background: user?.avatarColor }}>
                {user?.name?.charAt(0)}
            </div>
        </header>
    )
}
