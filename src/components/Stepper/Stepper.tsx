import { Icon } from '../Icon/Icon'
import styles from './Stepper.module.css'

type Props = {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  size?: 'sm' | 'md'
  label: string
}

export function Stepper({ value, onChange, min = 0, max = 100, step = 10, unit = '%', size = 'md', label }: Props) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  return (
    <div className={`${styles.root} ${styles[size]}`} role="group" aria-label={label}>
      <button type="button" className={styles.btn} aria-label={`${label}: меньше`} disabled={value <= min} onClick={() => onChange(clamp(value - step))}>
        <Icon name="minus" size={16} />
      </button>
      <output className={styles.num} aria-live="polite">{value}{unit}</output>
      <button type="button" className={styles.btn} aria-label={`${label}: больше`} disabled={value >= max} onClick={() => onChange(clamp(value + step))}>
        <Icon name="plus" size={16} />
      </button>
    </div>
  )
}
