import styles from "./form.module.css";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
};

export function Button({ fullWidth, className = "", ...props }: Props) {
  return (
    <button
      {...props}
      className={`${styles.submitButton} ${fullWidth ? styles.fullWidth : ""} ${className}`}
    />
  );
}