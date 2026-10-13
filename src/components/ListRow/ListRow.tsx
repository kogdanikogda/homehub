import { Chip } from '../Chip/Chip'
import { Icon, type IconName } from '../Icon/Icon'
import styles from './ListRow.module.css'

type Props = { icon: IconName; text: string; value?: string; tone?: 'default' | 'warning'; /** Метка рядом с названием, например «Changed» */ badge?: string }

/** Строка списка внутри диалога: иконка, текст, значение справа */
export function ListRow({ icon, text, value, tone = 'default', badge }: Props) {
  return (
    <div className={styles.row}>
      <Icon name={icon} size={22} className={styles.icon} />
      <span className={styles.text}>{text}</span>
      {badge && <Chip tone="warning" dot size="sm">{badge}</Chip>}
      {value && <span className={`${styles.value} ${tone === 'warning' ? styles.warn : ''}`}>{value}</span>}
    </div>
  )
}
