// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { useLang } from './index'
import { retranslate } from './retranslate'
import { useHome } from '../store/useHome'

afterEach(() => { useLang.getState().setLang('en'); useHome.getState().reset() })

describe('перевод готовых строк при смене языка', () => {
  it('точные строки и шаблоны в обе стороны', () => {
    expect(retranslate('Front door locked', 'ru')).toBe('Входная дверь заперта')
    expect(retranslate('Входная дверь заперта', 'en')).toBe('Front door locked')
    expect(retranslate('Cinema scene activated', 'ru')).toBe('Сцена «Кино» включена')
    // два английских текста переводятся одинаково — обратно получается любой из них
    expect(retranslate('Сцена «Кино» включена', 'en')).toMatch(/^Cinema scene (activated|is on)$/)
    expect(retranslate('Temperature limits set to 18–25°', 'ru')).toBe('Границы температуры: 18–25°')
  })

  it('формы слова для чисел', () => {
    expect(retranslate('Modified · 3 changes', 'ru')).toBe('Изменена · 3 правки')
    expect(retranslate('Изменена · 5 правок', 'en')).toBe('Modified · 5 changes')
  })

  it('незнакомый текст не меняется', () => {
    expect(retranslate('Lamp by the sofa', 'ru')).toBe('Lamp by the sofa')
  })

  it('журнал событий и сообщение переводятся при переключении языка', () => {
    useHome.getState().setDoorLocked(true)
    expect(useHome.getState().eventLog[0].x).toBe('Front door locked')
    useLang.getState().setLang('ru')
    expect(useHome.getState().eventLog[0].x).toBe('Входная дверь заперта')
    expect(useHome.getState().toasts.alexey?.text).toBe('Входная дверь заперта')
    useLang.getState().setLang('en')
    expect(useHome.getState().eventLog[0].x).toBe('Front door locked')
  })

  it('сообщение, подготовленное до переключения, показывается на новом языке', () => {
    useLang.getState().setLang('ru')
    useHome.getState().showToast('Cinema scene activated')
    expect(useHome.getState().toasts.tablet?.text).toBe('Сцена «Кино» включена')
  })
})
