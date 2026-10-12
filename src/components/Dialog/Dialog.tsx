import * as RadixDialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'
import { Button } from '../Button/Button'
import styles from './Dialog.module.css'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  lead?: string
  children?: ReactNode
  primaryLabel: string
  onPrimary: () => void
  secondaryLabel?: string
  /** Блокирует кнопку подтверждения (например, пока не выбрана сцена) */
  primaryDisabled?: boolean
}

export function Dialog({ open, onOpenChange, title, lead, children, primaryLabel, onPrimary, secondaryLabel = 'Cancel', primaryDisabled }: Props) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={styles.overlay} />
        <RadixDialog.Content className={styles.content} aria-describedby={lead ? undefined : undefined}>
          <RadixDialog.Title className={styles.title}>{title}</RadixDialog.Title>
          {lead && <RadixDialog.Description className={styles.lead}>{lead}</RadixDialog.Description>}
          {children && <div className={styles.body}>{children}</div>}
          <div className={styles.actions}>
            <RadixDialog.Close asChild>
              <Button variant="secondary">{secondaryLabel}</Button>
            </RadixDialog.Close>
            <Button variant="primary" onClick={onPrimary} disabled={primaryDisabled}>{primaryLabel}</Button>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
