import { Button } from '../Button/Button'
import styles from './FullLightButton.module.css'

type Props = {
  /** full — «Full light», back — «Back to previous light» */
  state: 'full' | 'back'
  onFull: () => void
  onBack: () => void
  /** lg — планшет, md — телефон */
  size?: 'lg' | 'md'
  /** На всю ширину карточки или по размеру текста (шапка страницы комнаты) */
  block?: boolean
}

/** Быстрый полный свет в комнате. После нажатия на этом же месте появляется возврат к прежнему свету. */
export function FullLightButton({ state, onFull, onBack, size = 'lg', block = true }: Props) {
  const cls = [block ? styles.block : '', state === 'back' ? styles.back : ''].filter(Boolean).join(' ')
  return state === 'full'
    ? <Button size={size} icon="sun" className={cls} onClick={onFull}>Full light</Button>
    : <Button size={size} variant="secondary" icon="back" className={cls} onClick={onBack}>Back to previous light</Button>
}
