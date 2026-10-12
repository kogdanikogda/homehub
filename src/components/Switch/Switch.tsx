import * as RadixSwitch from '@radix-ui/react-switch'
import styles from './Switch.module.css'

type Props = {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  disabled?: boolean
  size?: 'md' | 'sm'
  'aria-label': string
}

export function Switch({ size = 'md', ...rest }: Props) {
  return (
    <RadixSwitch.Root className={`${styles.root} ${styles[size]}`} {...rest}>
      <RadixSwitch.Thumb className={styles.thumb} />
    </RadixSwitch.Root>
  )
}
