import { useEffect, useRef, useState } from 'react'
import { Icon } from '../Icon/Icon'
import styles from './PinPad.module.css'

type Props = {
  /** Вызывается, когда набраны 4 цифры. true — PIN верный */
  onSubmit: (pin: string) => boolean
  hint?: string
}

export function PinPad({ onSubmit, hint }: Props) {
  const [digits, setDigits] = useState('')
  const [error, setError] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const press = (d: string) => {
    if (digits.length >= 4) return
    const next = digits + d
    setError(false)
    setDigits(next)
    if (next.length === 4 && !onSubmit(next)) {
      setError(true)
      timer.current = setTimeout(() => setDigits(''), 350)
    }
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
  return (
    <div className={styles.root}>
      <div className={styles.dots} aria-hidden="true">
        {[0, 1, 2, 3].map((i) => <span key={i} className={`${styles.dot} ${i < digits.length ? styles.on : ''}`} />)}
      </div>
      <p className={styles.error} role="alert">{error ? 'Wrong PIN. Try again.' : ''}</p>
      <div className={styles.pad}>
        {keys.map((k) => <button key={k} type="button" className={styles.key} onClick={() => press(k)}>{k}</button>)}
        <span />
        <button type="button" className={styles.key} onClick={() => press('0')}>0</button>
        <button type="button" className={`${styles.key} ${styles.del}`} aria-label="Delete" onClick={() => { setError(false); setDigits(digits.slice(0, -1)) }}>
          <Icon name="del" size={28} />
        </button>
      </div>
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  )
}
