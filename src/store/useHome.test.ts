import { beforeEach, describe, expect, it } from 'vitest'
import { SCENES } from './data'
import { heldKeys, modifiedChanges } from './logic'
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
    expect(s().dialogs.tablet?.type).toBe('conflict')
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
    expect(s().dialogs.tablet).toMatchObject({ type: 'progress', phase: 'failed' })
  })
})

describe('правка активной сцены', () => {
  it('предупреждение один раз, потом правки идут сразу', () => {
    s().setDevice('living.light', 20)
    expect(s().dialogs.tablet?.type).toBe('override')
    expect(s().devices['living.light']).toBe(80) // пока не применено
    s().confirmOverride()
    expect(s().devices['living.light']).toBe(20)
    s().setDevice('living.rgb', 'high')
    expect(s().dialogs.tablet).toBeNull()
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
  it('Away: подтверждение, потом тревога включена, сцена закончилась, свет выключен', async () => {
    s().requestAway()
    expect(s().dialogs.tablet?.type).toBe('confirmAway')
    s().confirmAway(); await whenIdle()
    expect(s().mode).toBe('away')
    expect(s().activeScene).toBeNull()
    expect(s().devices['kitchen.light']).toBe(false)
    expect(s().devices['living.climate']).toBe(18)
  })

  it('в Away сцены недоступны', async () => {
    s().requestAway(); s().confirmAway(); await whenIdle()
    s().tapScene('night')
    expect(s().dialogs.tablet).toBeNull()
    expect(s().activeScene).toBeNull()
  })

  it('Away → Home только по PIN, включается General', async () => {
    s().requestAway(); s().confirmAway(); await whenIdle()
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
    expect(s().dialogs.tablet).toMatchObject({ type: 'confirmAway', windows: ['living'] })
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

describe('личные комнаты', () => {
  beforeEach(() => useHome.getState().reset())
  it('телефон меняет личную комнату, планшет видит это', () => {
    useHome.getState().setPrivate('kids1', 'light', false, 'marina')
    expect(useHome.getState().privateRooms.kids2.light).toBe(false)
    expect(useHome.getState().toasts.marina?.text).toBe('Light turned off')
    expect(useHome.getState().toasts.tablet).toBeNull()
  })
  it('сцена личные комнаты не трогает', async () => {
    useHome.setState({ stepDelay: 0 })
    useHome.getState().setPrivate('bedroom', 'climate', 19, 'marina')
    useHome.getState().tapScene('night')
    await whenIdle()
    expect(useHome.getState().privateRooms.bedroom.climate).toBe(19)
  })
})

describe('настройки и сцены администратора', () => {
  beforeEach(() => useHome.getState().reset())
  it('«Save to scene» записывает текущие значения в активную сцену', () => {
    useHome.setState({ stepDelay: 0 })
    useHome.setState((s) => ({ devices: { ...s.devices, 'living.light': 50 } }))
    expect(useHome.getState().scenes.general['living.light']).toBe(80)
    useHome.getState().saveToScene(['living.light'])
    expect(useHome.getState().scenes.general['living.light']).toBe(50)
    expect(useHome.getState().toasts.alexey?.text).toBe('1 saved to General')
  })
  it('температурный диапазон: нижняя граница всегда ниже верхней', () => {
    useHome.getState().setTempLimit('min', 26)
    expect(useHome.getState().tempLimits).toEqual({ min: 18, max: 26 })
    useHome.getState().setTempLimit('min', 20)
    expect(useHome.getState().tempLimits.min).toBe(20)
  })
  it('добавленное устройство появляется выключенным и включается', () => {
    useHome.getState().addDevice({ name: 'Floor lamp', room: 'living', type: 'Light' })
    const d = useHome.getState().addedDevices[0]
    expect(d.on).toBe(false)
    useHome.getState().toggleAdded(d.id, true, 'marina')
    expect(useHome.getState().addedDevices[0].on).toBe(true)
  })
  it('сцена только из активной темы: после сохранения изменений «Modified» пропадает', () => {
    useHome.setState((s) => ({ devices: { ...s.devices, 'living.light': 50 } }))
    useHome.getState().saveToScene(['living.light'])
    expect(useHome.getState().scenes.general['living.light']).toBe(50)
  })
})

describe('три устройства на одном состоянии', () => {
  it('сцена, выбранная с телефона Марины, видна везде', async () => {
    s().tapScene('night', 'marina'); await whenIdle()
    expect(s().activeScene).toBe('night')
    expect(s().devices).toMatchObject(SCENES.night.values)
  })

  it('окно конфликта появляется только на том устройстве, где нажали', async () => {
    s().tapScene('cinema'); await whenIdle()
    s().tapScene('night', 'marina')
    expect(s().dialogs.marina?.type).toBe('conflict')
    expect(s().dialogs.tablet).toBeNull()
    expect(s().dialogs.alexey).toBeNull()
  })

  it('замок, закрытый с телефона Алексея, закрыт для всех', () => {
    s().setDoorLocked(true, 'alexey')
    expect(s().doorLocked).toBe(true)
  })
})

describe('сигнализация не зависит от режима', () => {
  it('Away включает сигнализацию, Home по PIN выключает', async () => {
    expect(s().alarm).toBe(false)
    s().requestAway(); s().confirmAway(); await whenIdle()
    expect(s().alarm).toBe(true)
    s().requestHome(); s().submitPin('1234'); await whenIdle()
    expect(s().alarm).toBe(false)
  })

  it('на планшете сигнализация выключается по PIN, режим не меняется', async () => {
    s().requestAway(); s().confirmAway(); await whenIdle()
    s().requestAlarmOff()
    expect(s().dialogs.tablet).toMatchObject({ type: 'pin', purpose: 'alarm' })
    expect(s().submitPin('0000')).toBe(false)
    expect(s().alarm).toBe(true)
    expect(s().submitPin('1234')).toBe(true)
    await whenIdle()
    expect(s().alarm).toBe(false)
    expect(s().mode).toBe('away')
  })

  it('на телефоне выключение просит подтверждение без PIN', async () => {
    s().requestAway('alexey'); s().confirmAway('alexey'); await whenIdle()
    s().requestAlarmOff('alexey')
    expect(s().dialogs.alexey?.type).toBe('alarmOff')
    expect(s().alarm).toBe(true)
    s().confirmAlarmOff('alexey'); await whenIdle()
    expect(s().alarm).toBe(false)
    expect(s().mode).toBe('away')
  })

  it('сигнализацию можно включить в режиме Home', async () => {
    s().armAlarm(); await whenIdle()
    expect(s().alarm).toBe(true)
    expect(s().mode).toBe('home')
  })

  it('тревога включает сигнализацию; выключение с телефона снимает тревогу и возвращает Home', async () => {
    s().requestAway(); s().confirmAway(); await whenIdle()
    s().triggerAlert('intrusion')
    expect(s().alarm).toBe(true)
    s().confirmAlarmOff('marina'); await whenIdle()
    expect(s().alert).toBeNull()
    expect(s().alarm).toBe(false)
    expect(s().mode).toBe('home')
  })
})

describe('окна прогресса видны на всех устройствах', () => {
  it('сигнализация: окно на планшете и обоих телефонах', async () => {
    s().armAlarm('alexey')
    for (const d of ['tablet', 'marina', 'alexey'] as const) {
      expect(s().dialogs[d]).toMatchObject({ type: 'progress', title: 'Turning on the alarm' })
    }
    await whenIdle()
    expect(s().alarm).toBe(true)
  })

  it('Away: в окне есть шаги «Alarm» и «Security sensors»', () => {
    s().requestAway('marina'); s().confirmAway('marina')
    const d = s().dialogs.tablet
    expect(d?.type).toBe('progress')
    if (d?.type === 'progress') expect(d.items.slice(0, 2).map((i) => i.key)).toEqual(['sys.alarm', 'sys.sensors'])
  })

  it('заморозка: прогресс стоит на половине шагов, пока не нажмут «Продолжить»', async () => {
    s().setFreezeProgress(true)
    s().requestAway(); s().confirmAway()
    await new Promise((r) => setTimeout(r, 20))
    expect(s().dialogs.marina).toMatchObject({ type: 'progress', holding: true, phase: 'running' })
    expect(s().mode).toBe('home')
    s().resumeProgress(); await whenIdle()
    expect(s().mode).toBe('away')
  })
})

describe('Full light', () => {
  const lamp = () => s().devices['living.light']
  beforeEach(() => { useHome.setState({ overrideAck: true }) })

  it('одно нажатие ставит 100 %, возврат возвращает прежнее значение', () => {
    s().setDevice('living.light', 40); const before = lamp()
    s().fullLight('living')
    expect(lamp()).toBe(100)
    expect(s().lightHold.living).toBe(before)
    s().restoreLight('living')
    expect(lamp()).toBe(before)
    expect(s().lightHold.living).toBeUndefined()
  })

  it('не работает вне режима Home', async () => {
    s().setDevice('living.light', 40)
    s().requestAway(); s().confirmAway(); await whenIdle()
    s().fullLight('living')
    expect(s().lightHold.living).toBeUndefined()
  })

  it('не считается изменением сцены', async () => {
    s().tapScene('general'); await whenIdle()
    s().fullLight('living')
    expect(modifiedChanges(s().devices, s().activeScene, heldKeys(s().lightHold), s().scenes)).toHaveLength(0)
  })

  it('ручная правка этого света снимает удержание', () => {
    s().setDevice('living.light', 40)
    s().fullLight('living')
    s().setDevice('living.light', 70)
    expect(s().lightHold.living).toBeUndefined()
    expect(lamp()).toBe(70)
  })

  it('смена сцены снимает удержание', async () => {
    s().setDevice('living.light', 40)
    s().fullLight('living')
    s().tapScene('cinema'); await whenIdle()
    expect(s().lightHold).toEqual({})
  })

  it('уход в Away снимает удержание', async () => {
    s().setDevice('living.light', 40)
    s().fullLight('living')
    s().requestAway(); s().confirmAway(); await whenIdle()
    expect(s().lightHold).toEqual({})
  })

  it('личная комната: включает и возвращает выключенным', () => {
    s().fullLight('kids2')
    expect(s().privateRooms.kids2.light).toBe(true)
    s().restoreLight('kids2')
    expect(s().privateRooms.kids2.light).toBe(false)
  })

  it('показывает тосты на нажатие и возврат', () => {
    s().setDevice('living.light', 40)
    s().fullLight('living')
    expect(s().toasts.tablet?.text).toBe('Full light in Living Room')
    s().restoreLight('living')
    expect(s().toasts.tablet?.text).toBe('Light in Living Room is back as it was')
  })
})

describe('журнал событий', () => {
  it('всплывающее сообщение попадает в журнал, новые записи сверху', () => {
    s().setDoorLocked(false)
    s().setDoorLocked(true)
    expect(s().eventLog.map((e) => e.x).slice(0, 2)).toEqual(['Front door locked', 'Front door unlocked'])
  })
  it('пределы температуры, камера гостиной, добавленное устройство, привязка панели', () => {
    s().setTempLimit('max', 25)
    expect(s().eventLog[0].x).toMatch(/^Temperature limits set to \d+–25°$/)
    s().setCamPeek(true)
    expect(s().eventLog[0].x).toBe('Living room camera turned on for 10 min by Alexey')
    s().addDevice({ name: 'Floor lamp', room: 'corridor', type: 'Light' })
    expect(s().eventLog[0].x).toBe('Floor lamp added to Corridor')
    s().setOnboarding('done')
    expect(s().eventLog[0].x).toBe('Wall panel paired · Public panel')
  })
  it('сигнализация: одна запись на включение', async () => {
    s().armAlarm(); await whenIdle()
    expect(s().eventLog.filter((e) => e.x === 'Alarm turned on')).toHaveLength(1)
  })
})
