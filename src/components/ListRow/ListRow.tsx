import { Icon, type IconName } from '../Icon/Icon'
import styles from './ListRow.module.css'

type Props = { icon: IconName; text: string; value?: string; tone?: 'default' | 'warning' }

/** Строка списка внутри диалога: иконка, текст, значение справа */
export function ListRow({ icon, text, value, tone = 'default' }: Props) {
  return (
    <div className={styles.row}>
      <Icon name={icon} size={22} className={styles.icon} />
      <span className={styles.text}>{text}</span>
      {value && <span className={`${styles.value} ${tone === 'warning' ? styles.warn : ''}`}>{value}</span>}
    </div>
  )
}
