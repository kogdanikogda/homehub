import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon, type IconName } from '../Icon/Icon'
import styles from './Button.module.css'

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  variant?: 'primary' | 'secondary' | 'inverse'
  /** lg — планшет (48), xl — крупная кнопка тревоги (76), md/sm — телефон (42/38) */
  size?: 'lg' | 'xl' | 'md' | 'sm'
  icon?: IconName
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'lg', icon, children, className, ...rest }: Props) {
  const cls = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ')
  return (
    <button type="button" className={cls} {...rest}>
      {icon && <Icon name={icon} size={size === 'xl' ? 26 : size === 'lg' ? 20 : 18} />}
      <span>{children}</span>
    </button>
  )
}
