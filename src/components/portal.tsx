import { createContext, useContext } from 'react'

/** Куда выводить окна и меню. Внутри планшета — в его рамку, чтобы они масштабировались вместе с ним. */
export const PortalContainer = createContext<HTMLElement | null>(null)
export const usePortalContainer = () => useContext(PortalContainer) ?? undefined
