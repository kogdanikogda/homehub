import { create } from 'zustand'
import { ru } from './ru'

export type Lang = 'en' | 'ru'
export const LANGS: { id: Lang; label: string; full: string }[] = [
  { id: 'en', label: 'EN', full: 'English' },
  { id: 'ru', label: 'RU', full: 'Русский' },
]

const STORAGE_KEY = 'homehub.lang'

function initial(): Lang {
  try {
    const fromUrl = new URLSearchParams(location.search).get('lang')
    if (fromUrl === 'en' || fromUrl === 'ru') return fromUrl
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'ru') return saved
  } catch { /* хранилище может быть недоступно */ }
  return 'en' // по умолчанию английский
}

export const useLang = create<{ lang: Lang; setLang: (l: Lang) => void }>()((set) => ({
  lang: initial(),
  setLang: (lang) => {
    try { localStorage.setItem(STORAGE_KEY, lang) } catch { /* ничего страшного */ }
    set({ lang })
  },
}))

export const getLang = () => useLang.getState().lang

/** Форма слова для русского: 1 стол, 2 стола, 5 столов */
function ruForm(n: number): 0 | 1 | 2 {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return 0
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 1
  return 2
}

/**
 * Перевод. Ключ — английский текст; в нём можно использовать {имя} для подстановок.
 * Если перевода нет, показывается английский текст.
 * Для чисел в словаре можно дать три формы [1, 2–4, 5+], выбираются по vars.n.
 */
export function t(key: string, vars?: Record<string, string | number>): string {
  let out = key
  if (getLang() === 'ru') {
    const hit = ru[key]
    if (hit !== undefined) out = Array.isArray(hit) ? hit[ruForm(Number(vars?.n ?? 0))] : hit
  }
  if (vars) out = out.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m))
  return out
}

/** Подписка на смену языка: компонент перерисуется. Возвращает текущий язык. */
export const useT = () => useLang((s) => s.lang)

/** Для toLocaleDateString и подобных */
export const locale = () => (getLang() === 'ru' ? 'ru-RU' : 'en-GB')
