// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { t, useLang } from './index'
import { ru } from './ru'
import { COUNTERTOP, DEVICES, KITCHEN_EXTRAS, MODE_NAMES, PRIVATE_DEVICES, ROOM_NAMES, SCENES } from '../store/data'
import { ENERGY } from '../store/energy'

/** Исходные тексты всех файлов приложения (без тестов, историй и самого словаря) */
const sources = Object.entries(import.meta.glob('/src/**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>)
  .filter(([path]) => !/\.(test|stories)\./.test(path) && !path.startsWith('/src/i18n/'))
  .map(([, text]) => text)

afterEach(() => useLang.getState().setLang('en'))

describe('язык по умолчанию и переключение', () => {
  it('по умолчанию английский', () => {
    expect(useLang.getState().lang).toBe('en')
    expect(t('Scenes')).toBe('Scenes')
  })

  it('на русском берёт перевод и подставляет значения', () => {
    useLang.getState().setLang('ru')
    expect(t('Scenes')).toBe('Сцены')
    expect(t('Activate {name}', { name: 'Кино' })).toBe('Включить: Кино')
  })

  it('форма слова зависит от числа', () => {
    useLang.getState().setLang('ru')
    expect(t('Modified · {n} changes', { n: 1 })).toBe('Изменена · 1 правка')
    expect(t('Modified · {n} changes', { n: 3 })).toBe('Изменена · 3 правки')
    expect(t('Modified · {n} changes', { n: 5 })).toBe('Изменена · 5 правок')
    expect(t('Modified · {n} changes', { n: 11 })).toBe('Изменена · 11 правок')
    expect(t('Modified · {n} changes', { n: 21 })).toBe('Изменена · 21 правка')
  })

  it('если перевода нет, показывает английский текст', () => {
    useLang.getState().setLang('ru')
    expect(t('A phrase nobody translated')).toBe('A phrase nobody translated')
  })

  it('названия комнат, сцен и устройств переводятся при чтении', () => {
    expect(ROOM_NAMES.living).toBe('Living Room')
    expect(SCENES.cinema.name).toBe('Cinema')
    useLang.getState().setLang('ru')
    expect(ROOM_NAMES.living).toBe('Гостиная')
    expect(SCENES.cinema.name).toBe('Кино')
    expect(DEVICES[0].label).toBe('Основной свет')
    expect(MODE_NAMES.away).toBe('Отсутствие')
  })
})

describe('словарь полный', () => {
  const used = new Set<string>()
  for (const src of sources) {
    for (const m of src.matchAll(/\bt\(\s*'((?:[^'\\]|\\.)*)'/g)) used.add(m[1].replace(/\\'/g, "'"))
  }

  it('для каждого t(\'…\') в коде есть русский перевод', () => {
    expect(used.size).toBeGreaterThan(300)
    expect([...used].filter((k) => !(k in ru))).toEqual([])
  })

  it('тексты из данных (комнаты, сцены, устройства, энергия) тоже переведены', () => {
    const data: string[] = [
      ...Object.values(ROOM_NAMES), ...Object.values(MODE_NAMES),
      ...DEVICES.flatMap((d) => [d.label, d.short]),
      ...Object.values(SCENES).flatMap((s) => [s.name, s.description]),
      ...KITCHEN_EXTRAS.map((e) => e.label), COUNTERTOP.label, COUNTERTOP.status,
      ...Object.values(PRIVATE_DEVICES).flat().map((d) => d.label),
      ...Object.values(ENERGY).flatMap((e) => [e.caption, e.compare.text, ...e.split.map((s) => s.label)]),
      'Floor lamp', 'Humidifier', 'Water leak sensor', 'Light', 'Climate', 'Sensor',
    ]
    expect(data.filter((k) => !(k in ru))).toEqual([])
  })

  it('в русских значениях остались все подстановки из английского ключа', () => {
    const bad = Object.entries(ru).filter(([k, v]) => {
      const need = [...k.matchAll(/\{(\w+)\}/g)].map((m) => m[1])
      return (Array.isArray(v) ? v : [v]).some((s) => need.some((n) => !s.includes(`{${n}}`)))
    }).map(([k]) => k)
    // «n» в фразах с тремя формами может уходить в слово: проверяем только что нет потерянных имён и комнат
    expect(bad.filter((k) => /\{(name|room|rooms|mode|at|code|time|what|pin)\}/.test(k))).toEqual([])
  })
})
