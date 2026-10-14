import { useEffect, useRef, useState, type ReactNode } from 'react'
import { PortalContainer } from '../portal'
import styles from './PhoneFrame.module.css'

/** Экран 390×844, рамка снаружи: 410×864 */
export const PHONE = { w: 410, h: 864 }

/** Телефон 390×844 с рамкой. Окна выводятся внутрь экрана, масштаб подгоняется под доступное место. */
export function PhoneFrame({ children, label, fit = true }: { children: ReactNode; label?: string; fit?: boolean }) {
  const [screen, setScreen] = useState<HTMLDivElement | null>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!fit) return
    const el = wrap.current?.parentElement
    if (!el) return
    const calc = () => setScale(Math.min(1, el.clientWidth / PHONE.w, el.clientHeight / PHONE.h))
    calc()
    const ro = new ResizeObserver(calc)
    ro.observe(el)
    return () => ro.disconnect()
  }, [fit])

  return (
    <div ref={wrap} className={styles.wrap} style={{ width: PHONE.w * scale, height: PHONE.h * scale }} role="group" aria-label={label}>
      <div className={styles.bezel} style={{ transform: `scale(${scale})` }}>
        <div className={styles.screen} ref={setScreen}>
          <PortalContainer.Provider value={screen}>{children}</PortalContainer.Provider>
        </div>
      </div>
    </div>
  )
}
