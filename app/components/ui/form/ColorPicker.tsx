"use client";
import styles from "./form.module.css";

type Props = {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
};

export default function ColorPicker({ colors, value, onChange }: Props) {
  return (
    <div className={styles.colorPicker}>
      {colors.map((color) => (
        <div
          key={color}
          tabIndex={0}
          aria-label={`Select color ${color}`}
          className={`${color === value ? styles.active : ""} ${styles.colorCircle}`}
          style={{ background: color }}
          onClick={() => onChange(color)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    onChange(color);
                }
            }}
        />
      ))}
    </div>
  );
}