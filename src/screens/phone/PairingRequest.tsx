import { Button } from '../../components/Button/Button'
import { Icon } from '../../components/Icon/Icon'
import { useHome } from '../../store/useHome'
import { PAIRING_CODE } from '../tablet/Onboarding'
import styles from './Phone.module.css'

/** Запрос новой настенной панели: владелец решает на своём телефоне */
export function PairingRequest() {
  const a = useHome.getState()
  return (
    <section className={styles.req} aria-label="Wall panel request">
      <Icon name="home" size={22} className={styles.reqIc} />
      <div className={styles.reqBody}>
        <div className={styles.reqTx}><b>New wall panel wants to join</b><small>Living room · Role: Public panel · Code {PAIRING_CODE}</small></div>
        <div className={styles.reqActs}>
          <Button variant="secondary" size="md" onClick={() => { a.setOnboarding('declined'); a.showToast('Panel declined', 'alexey') }}>Decline</Button>
          <Button size="md" onClick={() => { a.setOnboarding('done'); a.showToast('Panel approved', 'alexey') }}>Approve</Button>
        </div>
      </div>
    </section>
  )
}
