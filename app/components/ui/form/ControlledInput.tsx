"use client"

import { Controller, Control, FieldValues, Path } from "react-hook-form"
import styles from './form.module.css'


type Props<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
  type?: string;
  placeholder?: string;
};

export default function ControlledInput<T extends FieldValues>({
  name,
  control,
  label,
  type = "text",
  placeholder = "",
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={styles.formGroup}>
          <label htmlFor={name} className={styles.formLabel}>
            {label}
          </label>
          <input
            id={name}
            className={styles.formInput}
            type={type}
            placeholder={placeholder}
            {...field} />

          {fieldState.error && (
            <p className={styles.formError}>
              {fieldState?.error.message}
            </p>
          )}
        </div>
      )}
    />
  )
}

