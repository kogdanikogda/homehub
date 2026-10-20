import * as RadixSwitch from '@radix-ui/react-switch'
import styles from './Switch.module.css'
import { t } from '../../i18n'

type Props = {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  disabled?: boolean
  size?: 'md' | 'sm'
  /** Показать слева слово On / Off */
  showState?: boolean
  'aria-label': string
}

export function Switch({ size = 'md', showState, ...rest }: Props) {
  const sw = (
    <RadixSwitch.Root className={`${styles.root} ${styles[size]}`} {...rest}>
      <RadixSwitch.Thumb className={styles.thumb} />
    </RadixSwitch.Root>
  )
  if (!showState) return sw
  return (
    <div className={styles.field}>
      <span className={styles.state}>{rest.checked ? t('On') : t('Off')}</span>
      {sw}
    </div>
  )
}
