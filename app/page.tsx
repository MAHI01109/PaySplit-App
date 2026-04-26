"use client"
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react'

function Home() {
    const router = useRouter();
    const { isOnboarded, isLoggedIn } = useAuthStore();
    useEffect(() => {
        if (!isOnboarded) {
            router.replace("/onboarding");
        } else
            if (!isLoggedIn) {
                router.replace("/login");
            } else {
                router.replace("/dashboard");
            }
    }, [isOnboarded, isLoggedIn, router]);
    return null
}

export default Home