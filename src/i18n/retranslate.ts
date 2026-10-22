import { ru } from './ru'
import type { Lang } from './index'

/**
 * Перевод уже готовой строки на другой язык.
 * Журнал событий, всплывающие сообщения и заголовки окон прогресса хранятся готовым текстом
 * на том языке, который был включён в момент события. При смене языка их нужно перевести,
 * иначе после переключения EN → RU в журнале останутся английские записи (и наоборот).
 * Работает по тому же словарю ru.ts: точные строки и шаблоны с {подстановками}; подставленные
 * значения (названия комнат, сцен, устройств) переводятся так же, рекурсивно.
 */

type Template = { re: RegExp; vars: string[]; target: string | [string, string, string]; weight: number }

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function compile(pattern: string): { re: RegExp; vars: string[]; weight: number } {
  const vars: string[] = []
  const body = pattern.split(/(\{\w+\})/).map((part) => {
    const m = part.match(/^\{(\w+)\}$/)
    if (!m) return esc(part)
    vars.push(m[1])
    return '(.+?)'
  }).join('')
  return { re: new RegExp('^' + body + '$'), vars, weight: pattern.replace(/\{\w+\}/g, '').length }
}

let cache: Record<Lang, { exact: Map<string, string | [string, string, string]>; templates: Template[] }> | null = null

function tables() {
  if (cache) return cache
  const toRu = { exact: new Map<string, string | [string, string, string]>(), templates: [] as Template[] }
  const toEn = { exact: new Map<string, string | [string, string, string]>(), templates: [] as Template[] }
  for (const [key, val] of Object.entries(ru)) {
    const forms = Array.isArray(val) ? val : [val]
    if (key.includes('{')) toRu.templates.push({ ...compile(key), target: val })
    else if (!toRu.exact.has(key)) toRu.exact.set(key, val)
    for (const f of forms) {
      if (f.includes('{')) toEn.templates.push({ ...compile(f), target: key })
      else if (!toEn.exact.has(f)) toEn.exact.set(f, key)
    }
  }
  // Сначала самые конкретные шаблоны (больше постоянного текста)
  toRu.templates.sort((a, b) => b.weight - a.weight)
  toEn.templates.sort((a, b) => b.weight - a.weight)
  cache = { ru: toRu, en: toEn }
  return cache
}

function ruForm(n: number): 0 | 1 | 2 {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return 0
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 1
  return 2
}

function fill(target: string | [string, string, string], vars: Record<string, string>): string {
  const n = Number(vars.n)
  const s = Array.isArray(target) ? target[ruForm(Number.isFinite(n) ? n : 0)] : target
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? vars[k] : m))
}

/** Переводит готовую строку на язык `to`. Если строка не узнана, возвращает её без изменений. */
export function retranslate(text: string, to: Lang, depth = 0): string {
  if (!text || depth > 4) return text
  const table = tables()[to]
  const hit = table.exact.get(text)
  if (hit !== undefined) return typeof hit === 'string' ? hit : hit[2]
  for (const tpl of table.templates) {
    const m = text.match(tpl.re)
    if (!m) continue
    const vars: Record<string, string> = {}
    tpl.vars.forEach((name, i) => { vars[name] = retranslate(m[i + 1], to, depth + 1) })
    return fill(tpl.target, vars)
  }
  return text
}
