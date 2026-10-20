import { Logo } from '../Logo/Logo'
import { NavItem } from '../Shell/NavItem'
import styles from './Rail.module.css'
import { t } from '../../i18n'

export type Page = 'dashboard' | 'rooms' | 'scenes'

type Props = { page: Page; onPage: (p: Page) => void; onDim: () => void }

export function Rail({ page, onPage, onDim }: Props) {
  return (
    <nav className={styles.rail} aria-label={t('Main')}>
      <Logo />
      <div className={styles.group}>
        <NavItem icon="dash" label={t('Dashboard')} selected={page === 'dashboard'} onClick={() => onPage('dashboard')} />
        <NavItem icon="rooms" label={t('Rooms')} selected={page === 'rooms'} onClick={() => onPage('rooms')} />
        <NavItem icon="scenes" label={t('Scenes')} selected={page === 'scenes'} onClick={() => onPage('scenes')} />
        <span className={styles.grow} />
        <NavItem icon="moon" label={t('Dim')} onClick={onDim} />
      </div>
    </nav>
  )
}
