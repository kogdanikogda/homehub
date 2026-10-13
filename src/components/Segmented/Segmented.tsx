import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { Icon, type IconName } from '../Icon/Icon'
import styles from './Segmented.module.css'

export type SegmentItem = { value: string; label: string; icon?: IconName; disabled?: boolean }

type Props = {
  items: SegmentItem[]
  value: string
  onChange: (v: string) => void
  platform?: 'tablet' | 'phone' | 'phoneWide'
  label: string
}

export function Segmented({ items, value, onChange, platform = 'tablet', label }: Props) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      // Radix отдаёт '' при повторном нажатии на выбранный — игнорируем, выбор не снимается
      onValueChange={(v) => v && onChange(v)}
      aria-label={label}
      className={`${styles.root} ${styles[platform]}`}
    >
      {items.map((it) => (
        <ToggleGroup.Item key={it.value} value={it.value} disabled={it.disabled} className={styles.item}>
          {it.icon && <Icon name={it.icon} size={18} />}
          <span>{it.label}</span>
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  )
}
