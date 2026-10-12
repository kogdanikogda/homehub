import { Button } from '../Button/Button'
import { Icon, type IconName } from '../Icon/Icon'
import styles from './CriticalAlert.module.css'

type Props = { icon: IconName; title: string; subtitle: string; note: string; actionLabel: string; actionIcon: IconName; onAction: () => void }

/** Полноэкранная критическая тревога. Остаётся, пока её не подтвердят. */
export function CriticalAlert({ icon, title, subtitle, note, actionLabel, actionIcon, onAction }: Props) {
  return (
    <div className={styles.alert} role="alertdialog" aria-label={title}>
      <div className={styles.content}>
        <span className={styles.big}><Icon name={icon} size={56} /></span>
        <div className={styles.copy}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
          <p className={styles.note}>{note}</p>
        </div>
        <Button variant="inverse" size="xl" icon={actionIcon} onClick={onAction}>{actionLabel}</Button>
      </div>
    </div>
  )
}
