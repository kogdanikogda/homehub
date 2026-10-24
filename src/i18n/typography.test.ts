import { describe, expect, it } from 'vitest'
import { typo } from './typography'

const nb = ' '
describe('типографика', () => {
  it('русский: предлоги и частицы', () => {
    expect(typo('Включите, чтобы показать ошибки и редкие случаи в доме')).toBe(`Включите, чтобы показать ошибки и${nb}редкие случаи в${nb}доме`)
    expect(typo('Что идёт не так')).toBe(`Что${nb}идёт не${nb}так`)
    expect(typo('Дом — под охраной')).toBe(`Дом${nb}— под${nb}охраной`)
  })
  it('число и единица', () => {
    expect(typo('Все 3 устройства')).toBe('Все 3 устройства')
    expect(typo('Выдержка 21 °C и 40 %')).toBe(`Выдержка 21${nb}°C и${nb}40${nb}%`)
  })
  it('английский: короткие предлоги, без длинных цепочек', () => {
    expect(typo('Turn on to show the error cases')).toBe(`Turn on${nb}to show the error cases`)
  })
})
