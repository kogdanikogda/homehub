import type { ReactNode } from 'react'
import styles from './SceneCard.module.css'
import { t } from '../../i18n'

export function SceneCard({ children, hint }: { children: ReactNode; hint: string }) {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>{t('Scene')}</h2>
      <div className={styles.tiles}>{children}</div>
      <p className={styles.hint}>{hint}</p>
    </section>
  )
}
