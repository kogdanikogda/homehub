import { describe, expect, it } from 'vitest'
import { SCENES, awayValues } from './data'
import {
  averageTemperature, conflictTurnOff, deviceCount, devicesOnText, privateDeviceCount, heldKeys, lightButton, fullValue, diffToScene, formatValue, modifiedChanges, onCount, roomSummary,
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
    expect(roomSummary(22, 2, 5)).toBe('22° · 2 of 5 devices on')
    expect(roomSummary(21, 0, 5)).toBe('21° · All devices off')
  })
  it('«сколько из скольких»: одно, все, ни одного', () => {
    expect(devicesOnText(1, 6)).toBe('1 of 6 devices on')
    expect(devicesOnText(6, 6)).toBe('All 6 devices on')
    expect(devicesOnText(0, 6)).toBe('All devices off')
    expect(devicesOnText(1, 1)).toBe('1 device on')
    expect(devicesOnText(0, 1)).toBe('Device off')
  })
  it('всего устройств: климат и шторы считаются, кухня с подсветкой и допустройствами', () => {
    expect(deviceCount('living')).toBe(6)
    expect(deviceCount('kitchen')).toBe(5)
    expect(deviceCount('corridor')).toBe(1)
    expect(privateDeviceCount('kids1')).toBe(3)
    expect(privateDeviceCount('bedroom')).toBe(4)
  })
  it('добавленные устройства входят и в «всего», и в «включено»', () => {
    const added = [{ id: 1, name: 'Lamp', room: 'corridor' as const, type: 'Light', on: true }]
    expect(deviceCount('corridor', added)).toBe(2)
    expect(onCount('corridor', general, { bar: false, floor: false } as never, added)).toBe(2)
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

describe('кнопка «Full light»', () => {
  const priv = { kids1: { light: true }, kids2: { light: false } } as never
  it('значение полного света: 100 % у диммера, «вкл» у выключателя', () => {
    expect(fullValue('living.light')).toBe(100)
    expect(fullValue('kitchen.light')).toBe(true)
  })
  it('показывается только в Home, пока свет не полный и лампа отвечает', () => {
    const dim = { ...general, 'living.light': 60 }
    expect(lightButton('living', 'home', dim, priv, [], {})).toBe('full')
    expect(lightButton('living', 'home', { ...general, 'living.light': 100 }, priv, [], {})).toBeNull()
    expect(lightButton('living', 'away', dim, priv, [], {})).toBeNull()
    expect(lightButton('living', 'home', dim, priv, ['living.light'], {})).toBeNull()
  })
  it('после нажатия на том же месте «Back»', () => {
    expect(lightButton('living', 'home', general, priv, [], { living: 40 })).toBe('back')
  })
  it('личная комната: кнопка, пока свет выключен', () => {
    expect(lightButton('kids2', 'home', general, priv, [], {})).toBe('full')
  })
  it('удерживаемый свет не считается изменением сцены', () => {
    expect(heldKeys({ living: 40, kids2: false })).toEqual(['living.light'])
  })
})
