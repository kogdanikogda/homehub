import styles from './AlarmVeil.module.css'

/** Пелена режима сигнализации: подсветка по краям экрана. Не перехватывает касания. */
export function AlarmVeil({ radius }: { radius: number }) {
  return <div className={styles.veil} style={{ borderRadius: radius }} aria-hidden="true" data-testid="alarm-veil" />
}
