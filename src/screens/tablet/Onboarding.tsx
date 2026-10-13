import { useEffect } from 'react'
import { Button } from '../../components/Button/Button'
import { Icon, type IconName } from '../../components/Icon/Icon'
import type { OnboardingStep } from '../../store/types'
import { useHome } from '../../store/useHome'
import styles from './Onboarding.module.css'

const STEPS: { id: OnboardingStep[]; label: string }[] = [
  { id: ['welcome'], label: '1. Welcome' },
  { id: ['role'], label: '2. Role' },
  { id: ['pair', 'declined'], label: '3. Pair' },
  { id: ['done'], label: '4. Done' },
]
const ORDER: OnboardingStep[] = ['welcome', 'role', 'pair', 'done']
export const PAIRING_CODE = 'HH‑4821'
/** Сколько ждём ответа с телефона владельца, мс */
const APPROVAL_MS = 3500

// Декоративный QR-код из макета: решётка 21 × 21
const QR = [
  '########....#.#######', '#.....##.####.#.....#', '#.###.#...#.#.#.###.#', '#.###.##..#.###.###.#', '#.###.#####.###.###.#',
  '#.....###.##.##.....#', '########...#.########', '..#.#....#.#....#.#..', '###.#.####.#.####.#.#', '#.#....#.#....#.#....',
  '#.###..#.###..#.###..', '#.######.######.#####', '##.###.##.###.##.###.', '.#.##...#.##...#.##..', '#######.#....#.#....#',
  '#.....#.#.####.#.####', '#.###.#....#.#....#.#', '#.###.###..#.###..#.#', '#.###.######.######.#', '#.....####.##.###.##.',
  '#########...#.##...#.',
]

function Qr() {
  return (
    <svg className={styles.qr} viewBox="0 0 23 23" role="img" aria-label={`QR code, pairing code ${PAIRING_CODE}`}>
      {QR.flatMap((row, y) => [...row].map((c, x) => (c === '#' ? <rect key={`${x}-${y}`} x={x + 1} y={y + 1} width="1.02" height="1.02" /> : null)))}
    </svg>
  )
}

function Role({ icon, title, text, selected }: { icon: IconName; title: string; text: string; selected?: boolean }) {
  return (
    <div className={`${styles.role} ${selected ? styles.roleOn : ''}`} aria-disabled={!selected}>
      <Icon name={icon} size={32} className={styles.roleIcon} />
      <b>{title}</b>
      <span>{text}</span>
    </div>
  )
}

const SUMMARY: { icon: IconName; label: string; value: string }[] = [
  { icon: 'home', label: 'Role', value: 'Public panel' },
  { icon: 'dash', label: 'Shows', value: 'Dashboard · Rooms · Scenes' },
  { icon: 'lock', label: 'Hidden here', value: 'Security · Devices · Settings' },
  { icon: 'moon', label: 'Screen', value: 'Dims after 2 min, wakes on alerts' },
]

/** Первая настройка панели: приветствие, роль, сопряжение по QR, готово */
export function Onboarding({ step, approvalMs = APPROVAL_MS }: { step: OnboardingStep; approvalMs?: number }) {
  const set = useHome((s) => s.setOnboarding)
  const decline = useHome((s) => s.declinePairing)

  // Ждём ответ владельца: прототип сам «одобряет» или «отклоняет» запрос
  useEffect(() => {
    // Если решение принимает человек на телефоне администратора, прототип сам ничего не решает
    if (step !== 'pair' || useHome.getState().pairingManual) return
    const t = setTimeout(() => set(useHome.getState().declinePairing ? 'declined' : 'done'), approvalMs)
    return () => clearTimeout(t)
  }, [step, set, decline, approvalMs])

  const current = ORDER.indexOf(step === 'declined' ? 'pair' : step)

  return (
    <div className={styles.ob} role="dialog" aria-modal="true" aria-label="Set up this wall panel">
      <ol className={styles.steps}>
        {STEPS.map((s, i) => (
          <li key={s.label} className={`${styles.pill} ${i <= current ? styles.pillOn : ''}`} aria-current={i === current ? 'step' : undefined}>{s.label}</li>
        ))}
      </ol>

      <div className={styles.card}>
        {step === 'welcome' && (
          <>
            <div className={styles.text}>
              <h1>Set up this wall panel</h1>
              <p>This tablet will stay on the wall in the living room. Everyone at home can use it without signing in.</p>
            </div>
            <div className={styles.actsC}><Button onClick={() => set('role')}>Start setup</Button></div>
          </>
        )}

        {step === 'role' && (
          <>
            <h1>What will this tablet be?</h1>
            <div className={styles.roles}>
              <Role selected icon="home" title="Public panel" text="Dashboard, Rooms and Scenes for everyone at home. No security or device settings." />
              <Role icon="lock" title="Administrator" text="Administration lives on the owner’s phone. A wall panel is always public." />
            </div>
            <div className={styles.acts}>
              <Button variant="secondary" onClick={() => set('welcome')}>Back</Button>
              <Button onClick={() => set('pair')}>Continue</Button>
            </div>
          </>
        )}

        {step === 'pair' && (
          <>
            <h1>Approve on the owner’s phone</h1>
            <div className={styles.pair}>
              <Qr />
              <div className={styles.pairText}>
                <p>Open HomeHub on Alexey’s phone and scan this code, or approve the request that appeared there.</p>
                <span className={styles.code}>Pairing code {PAIRING_CODE}</span>
                <span className={styles.wait}><span className={styles.spinner} />Waiting for approval…</span>
              </div>
            </div>
            <div className={styles.acts}><Button variant="secondary" onClick={() => set('role')}>Back</Button></div>
          </>
        )}

        {step === 'declined' && (
          <>
            <div className={styles.text}>
              <h1>Pairing was declined</h1>
              <p>The request was declined on the owner’s phone. Check with Alexey and try again.</p>
            </div>
            <div className={styles.actsC}><Button onClick={() => set('pair')}>Try again</Button></div>
          </>
        )}

        {step === 'done' && (
          <>
            <h1>Panel is ready</h1>
            <ul className={styles.sum}>
              {SUMMARY.map((r) => (
                <li key={r.label}>
                  <Icon name={r.icon} size={22} />
                  <span>{r.label}</span>
                  <b>{r.value}</b>
                </li>
              ))}
            </ul>
            <div className={styles.actsC}><Button onClick={() => set(null)}>Open dashboard</Button></div>
          </>
        )}
      </div>
    </div>
  )
}
