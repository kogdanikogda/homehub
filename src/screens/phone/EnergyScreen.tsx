import { useState } from 'react'
import { Chip } from '../../components/Chip/Chip'
import { Icon } from '../../components/Icon/Icon'
import { BackLink, SectionLabel } from '../../components/Phone/Phone'
import { Segmented } from '../../components/Segmented/Segmented'
import { ENERGY, axisLabels, percentOf, type EnergyPeriod } from '../../store/energy'
import styles from './Phone.module.css'

const fmt = (n: number) => n.toFixed(1)
const GRID = { day: [0, 1, 2, 3], week: [0, 10, 20, 30], month: [0, 10, 20, 30] } as const

/** Энергия дома на телефоне: итог, график и разбивка по типам устройств */
export function EnergyScreen({ onBack, now = new Date() }: { onBack: () => void; now?: Date }) {
  const [period, setPeriod] = useState<EnergyPeriod>('week')
  const e = ENERGY[period]
  const labels = axisLabels(period, now)
  const slots = period === 'day' ? 24 : e.bars.length
  const peak = e.bars.indexOf(Math.max(...e.bars))

  return (
    <>
      <div className={styles.group} style={{ gap: 12 }}>
        <BackLink label="Home" onClick={onBack} />
        <Segmented platform="phoneWide" label="Period" value={period} onChange={(v) => setPeriod(v as EnergyPeriod)}
          items={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]} />
      </div>

      <div className={styles.hero}>
        <div className={styles.heroNum}><b>{fmt(e.total)}</b><span>kWh</span><small>{e.caption}</small></div>
        <Chip tone={e.compare.less ? 'success' : 'warning'} icon={e.compare.less ? 'check' : 'warn'} size="sm">{e.compare.text}</Chip>
      </div>

      <div className={styles.group}>
        <div className={styles.chartCard} role="img" aria-label={`Energy use, ${period}`}>
          <div className={styles.plot}>
            {GRID[period].map((g) => (
              <div key={g} className={styles.grid} style={{ bottom: `${(g / e.axisMax) * 100}%` }}><span>{g}</span></div>
            ))}
            <div className={styles.bars}>
              {Array.from({ length: slots }, (_, i) => e.bars[i]).map((v, i) => (
                <div key={i} className={styles.slot}>
                  {v !== undefined && (
                    <div className={`${styles.bar} ${i === e.bars.length - 1 ? styles.last : ''}`} style={{ height: `${(v / e.axisMax) * 100}%` }}>
                      {i === peak && period !== 'month' && <span className={styles.peak}>{v}</span>}
                    </div>
                  )}
                  {labels.has(i) && <span className={styles.tick}>{labels.get(i)}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <SectionLabel>Where it goes</SectionLabel>
        <div className={styles.split}>
          {e.split.map((r) => (
            <div key={r.label} className={styles.erow}>
              <span className={styles.ewhat}><Icon name={r.icon} size={18} />{r.label}</span>
              <span className={styles.eright}>
                <span className={styles.trk}><i style={{ width: `${percentOf(r.value, e.total)}%` }} /></span>
                <span className={styles.enum}>{fmt(r.value)}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
