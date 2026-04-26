"use client"
import { useRouter } from 'next/navigation'
import style from './onboarding.module.css'

import { FormProvider, useForm } from 'react-hook-form'
import { OnboardingFormData, onboardingSchema } from '@/lib/validation/onboarding.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/store/authStore'
import ControlledColorPicker from '@/app/components/ui/form/ControlledColorPicker'
import ControlledInput from '@/app/components/ui/form/ControlledInput'
import ControlledSelect from '@/app/components/ui/form/ControlledSelect'
import { Button } from '@/app/components/ui/form/Button'
import { avatarColors } from '@/constants/avatarColors'
import { currencies } from '@/constants/currencies'
import { useEffect } from 'react'


export default function Onboarding() {
  const router = useRouter();
  const { isOnboarded } = useAuthStore();
  const setUser = useAuthStore((state) => state.setUser);


  const methods = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      email: "",
      currency: "INR",
      avatarColor: avatarColors[0],
    },
  });

  const onSubmit = (data: OnboardingFormData) => {
    console.log("Form Data:", data);
    setUser({ ...data, id: crypto.randomUUID() });
    router.push("/login");
  };

  useEffect(() => {
    if (isOnboarded) {
      router.replace("/login");
    }
  }, []);

  return (
    <div className={style.bgImg}>
      <div className={style.container}>
        <h1 className={style.title}>PaySplit</h1>
        <h3 className={style.subtitle}>Split bills with ease</h3>
        <FormProvider {...methods}>
          <form className={style.form} onSubmit={methods.handleSubmit(onSubmit)}>
            <ControlledInput
              name="name"
              control={methods.control}
              label="Name"
              type="text"
              placeholder="John Doe"
            />
            <ControlledInput
              name="email"
              control={methods.control}
              label="Email"
              type="email"
              placeholder="Rt5Hl@example.com"
            />
            <ControlledSelect
              name="currency"
              control={methods.control}
              label="Preferred Currency"
              options={currencies.map((currency) => ({
                value: currency.code,
                label: `${currency.code} - ${currency.name}`,
              }))}
            />

            <ControlledColorPicker
              name="avatarColor"
              control={methods.control}
              label="Avatar Color"
              colors={avatarColors}
            />

            <Button type='submit' fullWidth>
              Get Started
            </Button>
          </form>
        </FormProvider>

      </div>
    </div>
  )
}

