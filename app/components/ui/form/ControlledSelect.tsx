import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import styles from './form.module.css'

type Option = {
    value: string;
    label: string;
};

type Props<T extends FieldValues> = {
    name: Path<T>;
    control: Control<T>;
    label: string;
    options: Option[];
};

export default function ControlledSelect<T extends FieldValues>({
    options,
    name,
    control,
    label,
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
                    <select
                        id={name}
                        {...field} className={styles.formSelect} >
                        <option value="">Select...</option>
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {fieldState.error && (
                        <p className={styles.formError}>
                            {fieldState.error.message}
                        </p>
                    )}
                </div>
            )}
        />
    )
}