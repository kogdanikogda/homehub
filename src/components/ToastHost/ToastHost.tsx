import { useEffect } from 'react'
import { Toast } from '../Toast/Toast'
import styles from './ToastHost.module.css'

type Props = {
  toast: { id: number; text: string } | null
  onDone: (id: number) => void
  ms?: number
  /** Отступ сверху: под шапкой планшета (92) или под строкой состояния телефона (68) */
  top?: number
}

/** Информационные уведомления: лёгкая плашка в верхней части экрана, исчезает сама */
export function ToastHost({ toast, onDone, ms = 3200, top = 92 }: Props) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => onDone(toast.id), ms)
    return () => clearTimeout(t)
  }, [toast, onDone, ms])
  if (!toast) return null
  return <div key={toast.id} className={styles.host} style={{ top }}><Toast>{toast.text}</Toast></div>
}
