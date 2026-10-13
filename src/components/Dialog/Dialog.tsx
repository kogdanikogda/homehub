import * as RadixDialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'
import { Button } from '../Button/Button'
import { usePortalContainer } from '../portal'
import styles from './Dialog.module.css'

type Action = { label: string; onClick: () => void; disabled?: boolean }

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  lead?: string
  /** Например «3 of 7» справа от заголовка */
  counter?: string
  /** Что-то справа от заголовка, например переключатель периода */
  headerExtra?: ReactNode
  /** 0…1 — тонкая полоса прогресса (4 px) */
  progress?: number
  children?: ReactNode
  /** Текст под содержимым */
  note?: string
  width?: number
  /** false — окно нельзя закрыть Esc и касанием вне окна (идёт процесс) */
  dismissible?: boolean
  primary?: Action
  /** Кнопка-отмена; false — не показывать. По умолчанию «Cancel» */
  secondary?: { label: string; onClick?: () => void } | false
}

export function Dialog({
  open, onOpenChange, title, lead, counter, headerExtra, progress, children, note, width = 660, dismissible = true, primary, secondary,
}: Props) {
  const container = usePortalContainer()
  const cancel = secondary === undefined ? { label: 'Cancel' } : secondary
  const block = dismissible ? undefined : (e: Event) => e.preventDefault()
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal container={container}>
        <RadixDialog.Overlay className={styles.overlay} />
        <RadixDialog.Content
          className={styles.content}
          style={{ width: `min(${width}px, calc(100vw - 32px))` }}
          aria-describedby={undefined}
          onEscapeKeyDown={block}
          onInteractOutside={block}
        >
          <div className={styles.header}>
            <RadixDialog.Title className={styles.title}>{title}</RadixDialog.Title>
            {counter && <span className={styles.counter}>{counter}</span>}
            {headerExtra}
          </div>
          {progress !== undefined && (
            <div className={styles.track}><div className={styles.fill} style={{ width: `${Math.round(progress * 100)}%` }} /></div>
          )}
          {lead && <p className={styles.lead}>{lead}</p>}
          {children && <div className={styles.body}>{children}</div>}
          {note && <p className={styles.note}>{note}</p>}
          {(primary || cancel) && (
            <div className={styles.actions}>
              {cancel && (
                cancel.onClick
                  ? <Button variant="secondary" onClick={cancel.onClick}>{cancel.label}</Button>
                  : <RadixDialog.Close asChild><Button variant="secondary">{cancel.label}</Button></RadixDialog.Close>
              )}
              {primary && <Button variant="primary" onClick={primary.onClick} disabled={primary.disabled}>{primary.label}</Button>}
            </div>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
