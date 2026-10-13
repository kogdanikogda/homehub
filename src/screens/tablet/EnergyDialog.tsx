import { useState } from 'react'
import { Chip } from '../../components/Chip/Chip'
import { Dialog } from '../../components/Dialog/Dialog'
import { Icon } from '../../components/Icon/Icon'
import { Segmented } from '../../components/Segmented/Segmented'
import { ENERGY, axisLabels, percentOf, type EnergyPeriod } from '../../store/energy'
import styles from './EnergyDialog.module.css'

const fmt = (n: number) => n.toFixed(1)
const GRID = { day: [0, 1, 2, 3], week: [0, 10, 20, 30], month: [0, 10, 20, 30] } as const

/** Общее потребление дома за день, неделю или месяц. Только итог и разбивка по типам устройств, не по комнатам */
export function EnergyDialog({ onClose, now = new Date() }: { onClose: () => void; now?: Date }) {
  const [period, setPeriod] = useState<EnergyPeriod>('day')
  const e = ENERGY[period]
  const labels = axisLabels(period, now)
  // За день показываем все 24 часа: будущие часы остаются пустыми
  const slots = period === 'day' ? 24 : e.bars.length
  const peak = e.bars.indexOf(Math.max(...e.bars))
  const caption = period === 'day'
    ? `${e.caption} · until ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    : e.caption

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()} title="Energy use" width={780} secondary={false}
      primary={{ label: 'Close', onClick: onClose }}
      headerExtra={
        <Segmented label="Period" value={period} onChange={(v) => setPeriod(v as EnergyPeriod)}
          items={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]} />
      }>
      <div className={styles.hero}>
        <div className={styles.big}>
          <span className={styles.num}>{fmt(e.total)}</span><span className={styles.unit}>kWh</span>
          <span className={styles.cap}>{caption}</span>
        </div>
        <Chip tone={e.compare.less ? 'success' : 'warning'} icon={e.compare.less ? 'check' : 'warn'} size="sm">{e.compare.text}</Chip>
      </div>

      <div className={styles.chart} role="img" aria-label={`Energy use, ${period}`}>
        <div className={styles.plot}>
          {GRID[period].map((g) => (
            <div key={g} className={styles.grid} style={{ bottom: `${(g / e.axisMax) * 100}%` }}><span>{g}</span></div>
          ))}
          <div className={styles.bars}>
            {Array.from({ length: slots }, (_, i) => e.bars[i]).map((v, i) => (
              <div key={i} className={styles.slot}>
                {v !== undefined && (
                  <div className={`${styles.bar} ${i === e.bars.length - 1 ? styles.last : ''}`} style={{ height: `${(v / e.axisMax) * 100}%` }}>
                    {i === peak && <span className={styles.peak}>{v}</span>}
                  </div>
                )}
                {labels.has(i) && <span className={styles.tick}>{labels.get(i)}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <h3 className={styles.h3}>Where it goes</h3>
      <div className={styles.split}>
        {e.split.map((r) => (
          <div key={r.label} className={styles.row}>
            <span className={styles.what}><Icon name={r.icon} size={18} />{r.label}</span>
            <span className={styles.trk}><span style={{ width: `${percentOf(r.value, e.total)}%` }} /></span>
            <span className={styles.val}>{fmt(r.value)}</span>
            <span className={styles.pct}>{percentOf(r.value, e.total)}%</span>
          </div>
        ))}
      </div>
    </Dialog>
  )
}
