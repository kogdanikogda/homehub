import { describe, expect, it } from 'vitest'
import { SCENES, awayValues } from './data'
import {
  averageTemperature, conflictTurnOff, diffToScene, formatValue, modifiedChanges, onCount, roomSummary,
  sceneControlledCount, windowAlertText, windowsText,
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

describe('страница комнат', () => {
  const extras = { 'kitchen.bar': false, 'kitchen.floor': true }
  it('считает включённые устройства', () => {
    const d = { ...SCENES.general.values }
    expect(onCount('living', d, extras)).toBe(1)
    expect(onCount('kitchen', d, extras)).toBe(2)
    expect(onCount('corridor', d, extras)).toBe(1)
  })
  it('подпись комнаты', () => {
    expect(roomSummary(22, 2)).toBe('22° · 2 on')
    expect(roomSummary(21, 0)).toBe('21° · All off')
  })
  it('сколько устройств задаёт сцена', () => {
    expect(sceneControlledCount('living', 'general')).toBe(4)
    expect(sceneControlledCount('living', 'cinema')).toBe(6)
    expect(sceneControlledCount('kitchen', 'cinema')).toBe(0)
    expect(sceneControlledCount('living', 'guests')).toBe(4)
    expect(sceneControlledCount('kitchen', 'general')).toBe(2)
    expect(sceneControlledCount('corridor', 'general')).toBe(1)
  })
})

import { ENERGY, axisLabels, percentOf } from './energy'
describe('энергия', () => {
  it('сумма столбиков сходится с итогом', () => {
    expect(ENERGY.day.bars.reduce((a, b) => a + b, 0)).toBeCloseTo(ENERGY.day.total, 0)
    expect(ENERGY.week.bars.reduce((a, b) => a + b, 0)).toBeCloseTo(ENERGY.week.total, 0)
    expect(ENERGY.month.bars.reduce((a, b) => a + b, 0)).toBeCloseTo(ENERGY.month.total, -1)
  })
  it('части равны итогу и дают 100%', () => {
    for (const p of ['day', 'week', 'month'] as const) {
      const e = ENERGY[p]
      expect(e.split.reduce((a, b) => a + b.value, 0)).toBeCloseTo(e.total, 0)
      expect(e.split.reduce((a, b) => a + percentOf(b.value, e.total), 0)).toBeGreaterThanOrEqual(99)
    }
  })
  it('подписи недели: последняя — Today', () => {
    expect(axisLabels('week', new Date(2026, 9, 13)).get(6)).toBe('Today')
    expect(axisLabels('week', new Date(2026, 9, 13)).get(0)).toBe('Wed')
  })
})
