import { beforeEach, describe, expect, it } from 'vitest'
import { SCENES } from './data'
import { initialState, useHome, whenIdle } from './useHome'

const s = () => useHome.getState()

beforeEach(() => {
  useHome.setState({ ...initialState(), stepDelay: 0 })
})

describe('смена сцены', () => {
  it('General → Cinema применяет значения сцены', async () => {
    s().tapScene('cinema')
    await whenIdle()
    expect(s().activeScene).toBe('cinema')
    expect(s().devices['living.tv']).toBe(true)
    expect(s().devices).toMatchObject(SCENES.cinema.values)
  })

  it('Cinema → Night сначала спрашивает про ТВ и звук', async () => {
    s().tapScene('cinema'); await whenIdle()
    s().tapScene('night')
    expect(s().dialog?.type).toBe('conflict')
    expect(s().activeScene).toBe('cinema') // пока ничего не изменилось
    s().confirmConflict(); await whenIdle()
    expect(s().activeScene).toBe('night')
    expect(s().devices['living.tv']).toBe(false)
    expect(s().devices['living.sound']).toBe(false)
  })

  it('Cancel в конфликте оставляет Cinema', async () => {
    s().tapScene('cinema'); await whenIdle()
    s().tapScene('night'); s().closeDialog()
    expect(s().activeScene).toBe('cinema')
    expect(s().devices['living.tv']).toBe(true)
  })

  it('устройство без ответа: сцена включена, но устройство помечено', async () => {
    s().setFailKeys(['living.tv'])
    s().tapScene('cinema'); await whenIdle()
    expect(s().activeScene).toBe('cinema')
    expect(s().unresponsive).toEqual(['living.tv'])
    expect(s().dialog).toMatchObject({ type: 'progress', phase: 'failed' })
  })
})

describe('правка активной сцены', () => {
  it('предупреждение один раз, потом правки идут сразу', () => {
    s().setDevice('living.light', 20)
    expect(s().dialog?.type).toBe('override')
    expect(s().devices['living.light']).toBe(80) // пока не применено
    s().confirmOverride()
    expect(s().devices['living.light']).toBe(20)
    s().setDevice('living.rgb', 'high')
    expect(s().dialog).toBeNull()
    expect(s().devices['living.rgb']).toBe('high')
  })

  it('Cancel не меняет устройство', () => {
    s().setDevice('living.light', 20); s().closeDialog()
    expect(s().devices['living.light']).toBe(80)
    expect(s().overrideAck).toBe(false)
  })

  it('«Reset to scene» возвращает сохранённые значения', () => {
    s().setDevice('living.light', 20); s().confirmOverride()
    s().resetToScene()
    expect(s().devices['living.light']).toBe(80)
  })

  it('новая сцена снимает временные правки и предупреждение', async () => {
    s().setDevice('living.light', 20); s().confirmOverride()
    s().tapScene('guests'); await whenIdle()
    expect(s().overrideAck).toBe(false)
    expect(s().devices).toMatchObject(SCENES.guests.values)
  })
})

describe('режимы дома', () => {
  it('Away: подтверждение, потом тревога включена, сцена закончилась, свет выключен', () => {
    s().requestAway()
    expect(s().dialog?.type).toBe('confirmAway')
    s().confirmAway()
    expect(s().mode).toBe('away')
    expect(s().activeScene).toBeNull()
    expect(s().devices['kitchen.light']).toBe(false)
    expect(s().devices['living.climate']).toBe(18)
  })

  it('в Away сцены недоступны', () => {
    s().requestAway(); s().confirmAway()
    s().tapScene('night')
    expect(s().dialog).toBeNull()
    expect(s().activeScene).toBeNull()
  })

  it('Away → Home только по PIN, включается General', async () => {
    s().requestAway(); s().confirmAway()
    s().requestHome()
    expect(s().submitPin('0000')).toBe(false)
    expect(s().mode).toBe('away')
    expect(s().submitPin('1234')).toBe(true)
    await whenIdle()
    expect(s().mode).toBe('home')
    expect(s().activeScene).toBe('general')
  })

  it('предупреждение об открытых окнах в окне подтверждения Away', () => {
    s().toggleWindow('living')
    s().requestAway()
    expect(s().dialog).toMatchObject({ type: 'confirmAway', windows: ['living'] })
  })
})

describe('тревоги', () => {
  it('дым снимается одним нажатием', () => {
    s().triggerAlert('smoke')
    expect(s().alert?.kind).toBe('smoke')
    s().acknowledgeSmoke()
    expect(s().alert).toBeNull()
  })

  it('вторжение снимается только PIN-кодом и будит экран', () => {
    s().dim()
    s().triggerAlert('intrusion')
    expect(s().dimmed).toBe(false)
    s().requestAlarmOff()
    expect(s().submitPin('1111')).toBe(false)
    expect(s().alert).not.toBeNull()
    expect(s().submitPin('1234')).toBe(true)
    expect(s().alert).toBeNull()
  })
})

describe('первая настройка', () => {
  it('начинается с приветствия и сбрасывается', () => {
    const s = useHome.getState()
    s.setOnboarding('welcome')
    expect(useHome.getState().onboarding).toBe('welcome')
    s.setDeclinePairing(true)
    expect(useHome.getState().declinePairing).toBe(true)
    s.reset()
    expect(useHome.getState().onboarding).toBeNull()
    expect(useHome.getState().declinePairing).toBe(false)
  })
})
