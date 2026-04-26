"use client"
import { FormProvider, useForm } from "react-hook-form";
import styles from "./login.module.css"
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { MOCK_USER } from "@/constants/auth";
import ControlledInput from "@/app/components/ui/form/ControlledInput";
import { Button } from "@/app/components/ui/form/Button";

function Login() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const login = useAuthStore((state) => state.login);
  const methods = useForm({ resolver: undefined, defaultValues: { email: "", password: "" } });

  const onSubmit = (data: { email: string; password: string }) => {
    if (data.email === MOCK_USER.email && data.password === MOCK_USER.password) {
      login();
      router.push("/dashboard");
    } else {
      alert("Invalid email or password");
    }
  };
  return (
    <div className={styles.bgImg}>
      <div className={styles.container}>
        <h1 className={styles.title}>Login</h1>
        <p className={styles.subtitle}>Welcome back! Please login to your account.</p>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>

            <ControlledInput
              name="email"
              control={methods.control}
              label="Email"
              type="email"
              placeholder="Enter your email"
            />

            <ControlledInput
              control={methods.control}
              name="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
            />

            <Button type="submit" className={styles.button}>Login</Button>

          </form>
        </FormProvider>
      </div>
    </div>
  )
}

export default Login