import { Button } from '../../components/Button/Button'
import { Icon } from '../../components/Icon/Icon'
import { useHome } from '../../store/useHome'
import { PAIRING_CODE } from '../tablet/Onboarding'
import styles from './Phone.module.css'
import { t } from '../../i18n'

/** Запрос новой настенной панели: владелец решает на своём телефоне */
export function PairingRequest() {
  const a = useHome.getState()
  return (
    <section className={styles.req} aria-label={t('Wall panel request')}>
      <Icon name="home" size={22} className={styles.reqIc} />
      <div className={styles.reqBody}>
        <div className={styles.reqTx}><b>{t('New wall panel wants to join')}</b><small>{t('Living room · Role: Public panel · Code {code}', { code: PAIRING_CODE })}</small></div>
        <div className={styles.reqActs}>
          <Button variant="secondary" size="md" onClick={() => { a.setOnboarding('declined'); a.showToast(t('Panel declined'), 'alexey') }}>{t('Decline')}</Button>
          <Button size="md" onClick={() => { a.setOnboarding('done'); a.showToast(t('Panel approved'), 'alexey') }}>{t('Approve')}</Button>
        </div>
      </div>
    </section>
  )
}
