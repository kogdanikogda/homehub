import { useEffect } from 'react'
import { Toast } from '../Toast/Toast'
import styles from './ToastHost.module.css'

type Props = { toast: { id: number; text: string } | null; onDone: (id: number) => void; ms?: number }

/** Информационные уведомления: лёгкая плашка, исчезает сама */
export function ToastHost({ toast, onDone, ms = 3200 }: Props) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => onDone(toast.id), ms)
    return () => clearTimeout(t)
  }, [toast, onDone, ms])
  if (!toast) return null
  return <div className={styles.host}><Toast key={toast.id}>{toast.text}</Toast></div>
}
