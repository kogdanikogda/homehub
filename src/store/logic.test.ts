import { describe, expect, it } from 'vitest'
import { SCENES, awayValues } from './data'
import {
  averageTemperature, conflictTurnOff, diffToScene, formatValue, modifiedChanges, windowAlertText, windowsText,
} from './logic'

const general = SCENES.general.values
const cinema = SCENES.cinema.values
const night = SCENES.night.values

describe('значения на экране', () => {
  it('формат как в макете', () => {
    expect(formatValue('living.light', 0)).toBe('Off')
    expect(formatValue('living.light', 80)).toBe('80%')
    expect(formatValue('living.climate', 22)).toBe('22°')
    expect(formatValue('living.tv', true)).toBe('On')
    expect(formatValue('living.rgb', 'low')).toBe('Low')
  })
})

describe('средняя температура (цифры из макета)', () => {
  it('General 21.8, Cinema 21.6, Night 21.0, Away 18.0', () => {
    expect(averageTemperature(general, 'home').toFixed(1)).toBe('21.8')
    expect(averageTemperature(cinema, 'home').toFixed(1)).toBe('21.6')
    expect(averageTemperature(night, 'home').toFixed(1)).toBe('21.0')
    expect(averageTemperature(awayValues(general), 'away').toFixed(1)).toBe('18.0')
  })
})

describe('сцены', () => {
  it('в чистой сцене нет изменений', () => {
    expect(modifiedChanges(cinema, 'cinema')).toHaveLength(0)
  })
  it('две правки Cinema дают «2 changes» как на T03', () => {
    const edited = { ...cinema, 'living.light': 20, 'living.rgb': 'high' }
    const ch = modifiedChanges(edited, 'cinema')
    expect(ch.map((c) => c.key)).toEqual(['living.light', 'living.rgb'])
  })
  it('Cinema → Night меняет ровно 7 устройств, как в окне прогресса', () => {
    expect(diffToScene(cinema, 'night')).toHaveLength(7)
  })
})

describe('конфликт Cinema → Night', () => {
  it('предупреждает про ТВ и звук', () => {
    const c = conflictTurnOff(cinema, 'cinema', 'night')
    expect(c.map((x) => x.key)).toEqual(['living.tv', 'living.sound'])
  })
  it('в других переходах конфликта нет', () => {
    expect(conflictTurnOff(general, 'general', 'night')).toHaveLength(0)
    expect(conflictTurnOff(cinema, 'cinema', 'general')).toHaveLength(0)
  })
})

describe('окна', () => {
  it('тексты', () => {
    expect(windowsText([])).toBe('All closed')
    expect(windowsText(['living'])).toBe('1 open')
    expect(windowAlertText(['living'])).toBe('Living Room window is open')
    expect(windowAlertText(['living', 'kids1'])).toBe('2 windows are open: Living Room, Kids Room 1')
  })
})
