"use client";

import { Controller, Control, FieldValues, Path } from "react-hook-form";
import ColorPicker from "./ColorPicker";
import styles from "./form.module.css";

type Props<T extends FieldValues> = {
    name: Path<T>;
    control: Control<T>;
    label: string;
    colors: string[];
};

export default function ControlledColorPicker<T extends FieldValues>({
    name,
    control,
    label,
    colors,
}: Props<T>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <div className={styles.formGroup}>
                    {label && (
                        <label htmlFor={name} className={styles.formLabel}>
                            {label}
                        </label>
                    )}
                    <ColorPicker
                        colors={colors}
                        value={field.value}
                        onChange={field.onChange}
                    />

                    {fieldState.error && (
                        <p className={styles.formError}>
                            {fieldState.error.message}
                        </p>
                    )}
                </div>
            )}
        />
    );
}