import { useEffect, useRef, useState, type ReactNode } from 'react'
import { PortalContainer } from '../portal'
import styles from './TabletFrame.module.css'

export const TABLET = { w: 1366, h: 1024 }

/** Планшет 1366×1024 с рамкой. Масштабируется под окно; окна и меню выводятся внутрь рамки. */
export function TabletFrame({ children, fit = true }: { children: ReactNode; fit?: boolean }) {
  const [screen, setScreen] = useState<HTMLDivElement | null>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!fit) return
    const el = wrap.current?.parentElement
    if (!el) return
    const calc = () => setScale(Math.min(1, el.clientWidth / TABLET.w, el.clientHeight / TABLET.h))
    calc()
    const ro = new ResizeObserver(calc)
    ro.observe(el)
    return () => ro.disconnect()
  }, [fit])

  return (
    <div ref={wrap} className={styles.wrap} style={{ width: TABLET.w * scale, height: TABLET.h * scale }}>
      <div className={styles.bezel} style={{ transform: `scale(${scale})` }}>
        <div className={styles.screen} ref={setScreen}>
          <PortalContainer.Provider value={screen}>{children}</PortalContainer.Provider>
        </div>
      </div>
    </div>
  )
}
