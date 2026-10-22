import { create } from 'zustand'
import {
  DEFAULT_SCENES, DEVICE_BY_KEY, INITIAL_EXTRAS, INITIAL_PRIVATE, MODE_NAMES, ROOM_NAMES, TEMP_LIMITS, PROTOTYPE_PIN, ROOM_ORDER, SCENES, awayValues, type DeviceValues, type SceneMap, type SceneValues,
} from './data'
import { LIGHT_KEY, conflictTurnOff, diffToScene, diffValues, fullValue, heldKeys, modifiedChanges, sysItems, type LightHold } from './logic'
import type { AlertKind, DeviceId, OnboardingStep, ExtraKey, DeviceKey, DeviceValue, DialogState, AddedDevice, Mode, PrivateRoomId, PrivateRooms, PrivateState, ProgressItem, RoomId, SceneId } from './types'
import { t, useLang } from '../i18n'
import { retranslate } from '../i18n/retranslate'

type Toast = { id: number; text: string } | null

type Windows = Record<RoomId, boolean>

export interface HomeState {
  mode: Mode
  /** Сигнализация не зависит от режима: её можно выключить с любого устройства */
  alarm: boolean
  devices: DeviceValues
  activeScene: SceneId | null
  /** Предупреждение о правке сцены показывается один раз за активацию */
  overrideAck: boolean
  /** Комнаты, где включён «Full light»: помним прежний свет, чтобы вернуть его одним нажатием */
  lightHold: LightHold
  /** Устройства, не ответившие при активации сцены */
  unresponsive: DeviceKey[]
  windowsOpen: Windows
  /** Для демо на трёх устройствах: запрос на подключение панели ждёт решения на телефоне администратора */
  pairingManual: boolean
  /** Когда устройство перестало отвечать (для технического оповещения) */
  offlineAt: string | null
  /** Диапазон температур, который задаёт администратор */
  tempLimits: { min: number; max: number }
  /** Через сколько минут бездействия панель приглушается */
  idleMinutes: 1 | 2 | 5
  vacationOpts: { presence: boolean; freeze: boolean; cameras: boolean }
  doorLocked: boolean
  /** Камера гостиной временно включена (по умолчанию дома выключена) */
  camPeek: boolean
  /** Записи журнала событий, добавленные в ходе работы (новые сверху) */
  eventLog: { t: string; x: string }[]
  addedDevices: AddedDevice[]
  /** Для прототипа: как поведёт себя добавление устройства */
  addFlow: { searchEmpty: boolean; connectFails: boolean }
  /** Состав и значения сцен: администратор может их менять */
  scenes: SceneMap
  /** Личные комнаты: сцены их не трогают, управляют телефоны семьи */
  privateRooms: PrivateRooms
  /** Кухонные устройства вне сцен */
  extras: Record<ExtraKey, boolean>
  /** Открытое окно на каждом устройстве: у планшета и телефонов окна свои */
  dialogs: Record<DeviceId, DialogState | null>
  /** Первая настройка панели; null — панель уже настроена */
  onboarding: OnboardingStep | null
  /** Для прототипа: владелец отклонит запрос на сопряжение */
  declinePairing: boolean
  toasts: Record<DeviceId, Toast>
  dimmed: boolean
  alert: { kind: AlertKind; at: string; since: number } | null
  /** Когда включили текущий режим охраны (Away / Vacation), ЧЧ:ММ */
  modeAt: string | null
  /** Для прототипа: какие устройства «не ответят» при следующей сцене */
  failKeys: DeviceKey[]
  /** Пауза между шагами прогресса, мс (в тестах 0) */
  stepDelay: number
  /** Отладка: остановить прогресс на половине шагов, пока не нажмут «Продолжить» */
  freezeProgress: boolean

  toggleExtra: (key: ExtraKey, on: boolean) => void
  setPairingManual: (v: boolean) => void
  setTempLimit: (which: 'min' | 'max', v: number) => void
  setIdleMinutes: (m: 1 | 2 | 5) => void
  setVacationOpt: (k: 'presence' | 'freeze' | 'cameras', v: boolean) => void
  setDoorLocked: (v: boolean, by?: DeviceId) => void
  setCamPeek: (v: boolean, by?: DeviceId) => void
  setAddFlow: (patch: Partial<HomeState['addFlow']>) => void
  addDevice: (d: Omit<AddedDevice, 'id' | 'on'>) => void
  toggleAdded: (id: number, on: boolean, by?: DeviceId) => void
  /** Админ: сохранить сцену целиком (экран «Edit scene») */
  saveScene: (id: SceneId, values: SceneValues) => void
  /** Админ: записать текущие значения выбранных устройств в активную сцену */
  saveToScene: (keys: DeviceKey[], by?: DeviceId) => void
  setPrivate: <K extends keyof PrivateState>(room: PrivateRoomId, key: K, value: PrivateState[K], by?: DeviceId) => void
  setDevice: (key: DeviceKey, value: DeviceValue, by?: DeviceId) => void
  /** Быстрый полный свет в комнате: одно нажатие, без подтверждений, не меняет сцену */
  fullLight: (room: RoomId, by?: DeviceId) => void
  /** Вернуть свет комнаты таким, каким он был до «Full light» */
  restoreLight: (room: RoomId, by?: DeviceId) => void
  confirmOverride: (by?: DeviceId) => void
  tapScene: (id: SceneId, by?: DeviceId) => void
  confirmConflict: (by?: DeviceId) => void
  /** Окно сцены Night: переключатель «включить сигнализацию» и запуск */
  setNightAlarm: (on: boolean, by?: DeviceId) => void
  confirmNight: (by?: DeviceId) => void
  resetToScene: (by?: DeviceId) => void
  requestAway: (by?: DeviceId) => void
  confirmAway: (by?: DeviceId) => void
  /** Включается админом с телефона; на публичной панели недоступно */
  enterVacation: (by?: DeviceId) => void
  requestHome: (by?: DeviceId) => void
  /** true — PIN верный */
  submitPin: (pin: string, by?: DeviceId) => boolean
  openWindows: (by?: DeviceId) => void
  setOnboarding: (step: OnboardingStep | null) => void
  setDeclinePairing: (v: boolean) => void
  openEnergy: (by?: DeviceId) => void
  closeDialog: (by?: DeviceId) => void
  logEvent: (text: string) => void
  showToast: (text: string, by?: DeviceId) => void
  clearToast: (id: number, by?: DeviceId) => void
  dim: () => void
  wake: () => void
  triggerAlert: (kind: AlertKind) => void
  acknowledgeSmoke: () => void
  requestAlarmOff: (by?: DeviceId) => void
  /** Телефон: подтверждение выключения; планшет выключает по PIN */
  confirmAlarmOff: (by?: DeviceId) => void
  armAlarm: (by?: DeviceId) => void
  toggleWindow: (room: RoomId) => void
  setFailKeys: (keys: DeviceKey[]) => void
  setFreezeProgress: (v: boolean) => void
  resumeProgress: () => void
  reset: () => void
}

const closedWindows = (): Windows => Object.fromEntries(ROOM_ORDER.map((r) => [r, false])) as Windows

export const initialState = () => ({
  mode: 'home' as Mode,
  alarm: false,
  devices: { ...SCENES.general.values } as DeviceValues,
  activeScene: 'general' as SceneId | null,
  overrideAck: false,
  lightHold: {} as LightHold,
  unresponsive: [] as DeviceKey[],
  windowsOpen: closedWindows(),
  pairingManual: false,
  offlineAt: null as string | null,
  tempLimits: { ...TEMP_LIMITS },
  idleMinutes: 2 as 1 | 2 | 5,
  vacationOpts: { presence: true, freeze: true, cameras: true },
  doorLocked: true,
  camPeek: false,
  eventLog: [] as { t: string; x: string }[],
  addedDevices: [] as AddedDevice[],
  addFlow: { searchEmpty: false, connectFails: false },
  scenes: structuredClone(DEFAULT_SCENES) as SceneMap,
  privateRooms: structuredClone(INITIAL_PRIVATE) as PrivateRooms,
  extras: { ...INITIAL_EXTRAS },
  dialogs: { tablet: null, marina: null, alexey: null } as Record<DeviceId, DialogState | null>,
  onboarding: null as OnboardingStep | null,
  declinePairing: false,
  toasts: { tablet: null, marina: null, alexey: null } as Record<DeviceId, Toast>,
  dimmed: false,
  alert: null as HomeState['alert'],
  modeAt: null as string | null,
  failKeys: [] as DeviceKey[],
  stepDelay: 450,
  freezeProgress: false,
})

let runToken = 0
let toastId = 0
let deviceId = 0
let lastRun: Promise<void> = Promise.resolve()
let gate: (() => void) | null = null
/** Для тестов: дождаться окончания прогресса сцены */
export const whenIdle = () => lastRun

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const nowHHMM = () => new Date().toTimeString().slice(0, 5)

export const useHome = create<HomeState>()((set, get) => {
  /** Журнал событий: новые записи сверху, как в прототипе */
  // Текст приводится к текущему языку: сообщение могло быть подготовлено до переключения языка
  const log = (x: string) => set((st) => ({ eventLog: [{ t: nowHHMM(), x: retranslate(x, useLang.getState().lang) }, ...st.eventLog] }))
  /** Всплывающее сообщение; как в прототипе, каждое попадает и в журнал событий */
  const toast = (text: string, by: DeviceId = 'tablet', inLog = true) => {
    text = retranslate(text, useLang.getState().lang)
    set((s) => ({ toasts: { ...s.toasts, [by]: { id: ++toastId, text } } }))
    if (inLog) log(text)
  }
  const setDialog = (by: DeviceId, d: DialogState | null) =>
    set((s) => ({ dialogs: { ...s.dialogs, [by]: d } }))
  const dialogOf = (by: DeviceId) => get().dialogs[by]

  const releaseHold = (room: RoomId) =>
    set((s) => (room in s.lightHold ? { lightHold: Object.fromEntries(Object.entries(s.lightHold).filter(([r]) => r !== room)) as LightHold } : s))

  const apply = (key: DeviceKey, value: DeviceValue, by: DeviceId) => {
    set((s) => ({ devices: { ...s.devices, [key]: value } }))
    // Ручная правка света отменяет «вернуть как было»
    if (DEVICE_BY_KEY[key].room in get().lightHold && LIGHT_KEY[DEVICE_BY_KEY[key].room] === key) releaseHold(DEVICE_BY_KEY[key].room)
    const def = DEVICE_BY_KEY[key]
    if (def.kind === 'toggle') toast(value ? t('{name} turned on', { name: def.short }) : t('{name} turned off', { name: def.short }), by)
  }

  const ALL: DeviceId[] = ['tablet', 'marina', 'alexey']
  const applyDone = (current: DeviceValues, target: DeviceValues | Partial<DeviceValues>, work: ProgressItem[]): DeviceValues =>
    Object.fromEntries(
      Object.entries(current).map(([k, v]) => [k, work.some((w) => w.key === k && w.status === 'done') ? (target as Record<string, DeviceValue>)[k] : v]),
    ) as DeviceValues

  type Job = {
    title: string
    doneTitle: string
    items: ProgressItem[]
    /** Вызывается, когда все шаги закончились; принимает итог по шагам */
    commit: (work: ProgressItem[]) => void
    /** Уведомление после успешного завершения */
    toast: string
  }

  /** Окно прогресса: одно на все устройства, шаги идут по очереди */
  const runJob = (by: DeviceId, job: Job): Promise<void> => {
    const token = ++runToken
    const publish = (items: ProgressItem[], phase: 'running' | 'done' | 'failed', holding = false) =>
      set((st) => ({
        dialogs: { ...st.dialogs, ...Object.fromEntries(ALL.map((d) => [d, { type: 'progress', title: job.title, doneTitle: job.doneTitle, items, phase, holding }])) },
      }))
    const closeAll = () =>
      set((st) => ({ dialogs: Object.fromEntries(ALL.map((d) => [d, st.dialogs[d]?.type === 'progress' ? null : st.dialogs[d]])) as Record<DeviceId, DialogState | null> }))
    const work: ProgressItem[] = job.items.map((i) => ({ ...i, status: 'waiting' as const }))
    publish([...work], 'running')

    const run = (async () => {
      const half = Math.ceil(work.length / 2)
      for (let i = 0; i < work.length; i++) {
        if (get().freezeProgress && i === half && work.length > 1) {
          publish([...work], 'running', true)
          await new Promise<void>((r) => { gate = r })
          gate = null
          if (token !== runToken) return
        }
        work[i] = { ...work[i], status: 'running' }
        publish([...work], 'running')
        await sleep(get().stepDelay)
        if (token !== runToken) return
        const isDevice = !work[i].key.startsWith('sys.')
        work[i] = { ...work[i], status: isDevice && get().failKeys.includes(work[i].key as DeviceKey) ? 'failed' : 'done' }
        publish([...work], 'running')
      }
      job.commit(work)
      const failed = work.some((w) => w.status === 'failed')
      publish(work, failed ? 'failed' : 'done')
      if (!failed) {
        toast(job.toast, by)
        if (!get().freezeProgress) {
          await sleep(get().stepDelay * 3)
          if (token === runToken) closeAll()
        }
      }
    })()
    lastRun = run
    return run
  }

  /** arm — вместе со сценой включить сигнализацию (вариант для сцены Night) */
  const sceneJob = (id: SceneId, by: DeviceId, arm = false) => {
    const target = get().scenes[id]
    const items: ProgressItem[] = [...(arm ? sysItems(true) : []), ...diffToScene(get().devices, id, get().scenes).map((c) => ({ ...c, status: 'waiting' as const }))]
    return runJob(by, {
      title: t('Activating “{name}”', { name: SCENES[id].name }), doneTitle: t('{name} scene is on', { name: SCENES[id].name }), items,
      toast: arm ? t('{name} scene on. Alarm is on.', { name: SCENES[id].name }) : t('{name} scene activated', { name: SCENES[id].name }),
      commit: (work) => {
        const failed = work.filter((w) => w.status === 'failed').map((w) => w.key as DeviceKey)
        set((s) => ({ devices: applyDone(s.devices, target as DeviceValues, work), activeScene: id, alarm: arm || s.alarm, overrideAck: false, lightHold: {}, unresponsive: failed, offlineAt: failed.length ? nowHHMM() : null }))
      },
    })
  }

  /** Away и Vacation: сигнализация и датчики включаются, свет и медиа выключаются */
  const awayJob = (mode: 'away' | 'vacation', by: DeviceId) => {
    const target = awayValues(get().devices)
    const items: ProgressItem[] = [...sysItems(true), ...diffValues(get().devices, target).map((c) => ({ ...c, status: 'waiting' as const }))]
    return runJob(by, {
      title: t('Turning on {mode} mode', { mode: MODE_NAMES[mode] }), doneTitle: t('{mode} mode is on', { mode: MODE_NAMES[mode] }), items, toast: t('{mode} mode on. Alarm is on.', { mode: MODE_NAMES[mode] }),
      commit: (work) => {
        const failed = work.filter((w) => w.status === 'failed').map((w) => w.key as DeviceKey)
        set((s) => ({ mode, modeAt: nowHHMM(), alarm: true, devices: applyDone(s.devices, target, work), activeScene: null, overrideAck: false, lightHold: {}, unresponsive: failed, offlineAt: failed.length ? nowHHMM() : null }))
      },
    })
  }

  /** Возврат домой: сигнализация выключается, включается сцена General */
  const homeJob = (by: DeviceId, message: string) => {
    const target = get().scenes.general
    const items = [...sysItems(false), ...diffToScene(get().devices, 'general', get().scenes).map((c) => ({ ...c, status: 'waiting' as const }))]
    return runJob(by, {
      title: t('Switching to Home mode'), doneTitle: t('Home mode is on'), items, toast: message,
      commit: (work) => {
        const failed = work.filter((w) => w.status === 'failed').map((w) => w.key as DeviceKey)
        set((s) => ({ mode: 'home', alarm: false, devices: applyDone(s.devices, target as DeviceValues, work), activeScene: 'general', overrideAck: false, lightHold: {}, unresponsive: failed, offlineAt: failed.length ? nowHHMM() : null }))
      },
    })
  }

  const alarmJob = (on: boolean, by: DeviceId) =>
    runJob(by, {
      title: on ? t('Turning on the alarm') : t('Turning off the alarm'), doneTitle: on ? t('Alarm is on') : t('Alarm is off'), items: sysItems(on),
      toast: on ? t('Alarm turned on') : t('Alarm turned off'), commit: () => set({ alarm: on }),
    })

  /** Выключение сигнализации: после тревоги дом возвращается в режим Home */
  const alarmOff = (by: DeviceId) => {
    if (get().alert) {
      set({ alert: null })
      return homeJob(by, t('Alarm turned off. Home mode is on.'))
    }
    return alarmJob(false, by)
  }

  return {
    ...initialState(),

    setDevice: (key, value, by = 'tablet') => {
      const s = get()
      if (s.devices[key] === value) return
      if (s.mode === 'home' && s.activeScene && !s.overrideAck) {
        setDialog(by, { type: 'override', key, from: s.devices[key], to: value, scene: s.activeScene })
        return
      }
      apply(key, value, by)
    },

    fullLight: (room, by = 'tablet') => {
      const s = get()
      if (s.mode !== 'home' || room in s.lightHold) return
      const key = LIGHT_KEY[room]
      if (key) {
        if (s.devices[key] === fullValue(key)) return
        set({ devices: { ...s.devices, [key]: fullValue(key) }, lightHold: { ...s.lightHold, [room]: s.devices[key] } })
      } else {
        const r = room as PrivateRoomId
        if (s.privateRooms[r].light) return
        set({ privateRooms: { ...s.privateRooms, [r]: { ...s.privateRooms[r], light: true } }, lightHold: { ...s.lightHold, [room]: false } })
      }
      toast(t('Full light in {room}', { room: ROOM_NAMES[room] }), by)
    },

    restoreLight: (room, by = 'tablet') => {
      const s = get()
      if (!(room in s.lightHold)) return
      const prev = s.lightHold[room] as DeviceValue
      const rest = Object.fromEntries(Object.entries(s.lightHold).filter(([r]) => r !== room)) as LightHold
      const key = LIGHT_KEY[room]
      if (key) set({ devices: { ...s.devices, [key]: prev }, lightHold: rest })
      else set({ privateRooms: { ...s.privateRooms, [room as PrivateRoomId]: { ...s.privateRooms[room as PrivateRoomId], light: Boolean(prev) } }, lightHold: rest })
      toast(t('Light in {room} is back as it was', { room: ROOM_NAMES[room] }), by)
    },

    confirmOverride: (by = 'tablet') => {
      const d = dialogOf(by)
      if (d?.type !== 'override') return
      apply(d.key, d.to, by)
      set({ overrideAck: true })
      setDialog(by, null)
    },

    tapScene: (id, by = 'tablet') => {
      const s = get()
      if (s.mode !== 'home') return
      if (id === s.activeScene) {
        if (modifiedChanges(s.devices, s.activeScene, [...s.unresponsive, ...heldKeys(s.lightHold)], s.scenes).length) setDialog(by, { type: 'changes', scene: id })
        return
      }
      const turnOff = conflictTurnOff(s.devices, s.activeScene, id, s.scenes)
      if (id === 'night') setDialog(by, { type: 'night', turnOff, alarm: false })
      else if (turnOff.length) setDialog(by, { type: 'conflict', target: id, turnOff })
      else void sceneJob(id, by)
    },

    setNightAlarm: (on, by = 'tablet') => {
      const d = dialogOf(by)
      if (d?.type === 'night') setDialog(by, { ...d, alarm: on })
    },

    confirmNight: (by = 'tablet') => {
      const d = dialogOf(by)
      if (d?.type === 'night') void sceneJob('night', by, d.alarm)
    },

    confirmConflict: (by = 'tablet') => {
      const d = dialogOf(by)
      if (d?.type === 'conflict') void sceneJob(d.target, by)
    },

    resetToScene: (by = 'tablet') => {
      const s = get()
      if (!s.activeScene) return
      set({ devices: { ...s.devices, ...s.scenes[s.activeScene] }, unresponsive: [], lightHold: {} })
      setDialog(by, null)
      toast(t('{name} restored', { name: SCENES[s.activeScene].name }), by)
    },

    requestAway: (by = 'tablet') => {
      const windows = ROOM_ORDER.filter((r) => get().windowsOpen[r])
      setDialog(by, { type: 'confirmAway', windows })
    },

    confirmAway: (by = 'tablet') => {
      setDialog(by, null)
      void awayJob('away', by)
    },

    enterVacation: (by = 'alexey') => {
      setDialog(by, null)
      void awayJob('vacation', by)
    },

    // На телефоне человек уже вошёл в приложение, поэтому PIN нужен только на общей панели
    requestHome: (by = 'tablet') => {
      if (by === 'tablet') setDialog(by, { type: 'pin', purpose: 'home' })
      else void homeJob(by, by === 'alexey' ? t('Home mode turned on from Alexey’s phone') : t('Home mode turned on from Marina’s phone'))
    },

    submitPin: (pin, by = 'tablet') => {
      const d = dialogOf(by)
      if (d?.type !== 'pin' || pin !== PROTOTYPE_PIN) return false
      setDialog(by, null)
      if (d.purpose === 'home') void homeJob(by, t('Alarm off. Welcome home. General scene is active.'))
      else void alarmOff(by)
      return true
    },

    openWindows: (by = 'tablet') => setDialog(by, { type: 'windows' }),
    setOnboarding: (step) => { set({ onboarding: step }); if (step === 'done') log(t('Wall panel paired · Public panel')) },
    setDeclinePairing: (v) => set({ declinePairing: v }),
    openEnergy: (by = 'tablet') => setDialog(by, { type: 'energy' }),
    closeDialog: (by = 'tablet') => {
      runToken++ // закрытие окна прогресса не отменяет сцену, но останавливает автозакрытие
      setDialog(by, null)
    },
    showToast: toast,
    clearToast: (id, by = 'tablet') => set((s) => (s.toasts[by]?.id === id ? { toasts: { ...s.toasts, [by]: null } } : s)),
    dim: () => set({ dimmed: true }),
    wake: () => set({ dimmed: false }),

    triggerAlert: (kind) => set((s) => ({ alert: { kind, at: nowHHMM(), since: Date.now() }, alarm: kind === 'intrusion' ? true : s.alarm, dimmed: false, dialogs: { ...s.dialogs, tablet: null } })),
    acknowledgeSmoke: () => set({ alert: null }),
    // На общей панели нужен PIN, на телефоне хватает подтверждения
    requestAlarmOff: (by = 'tablet') => setDialog(by, by === 'tablet' ? { type: 'pin', purpose: 'alarm' } : { type: 'alarmOff' }),
    confirmAlarmOff: (by = 'tablet') => {
      setDialog(by, null)
      void alarmOff(by)
    },
    armAlarm: (by = 'tablet') => { void alarmJob(true, by) },

    setPairingManual: (v) => set({ pairingManual: v }),
    setTempLimit: (which, v) =>
      set((s) => {
        const next = { ...s.tempLimits, [which]: v }
        // Нижняя граница не выше верхней: держим хотя бы 1°
        if (next.min >= next.max) return s
        return { tempLimits: next, eventLog: [{ t: nowHHMM(), x: t('Temperature limits set to {min}–{max}°', { min: next.min, max: next.max }) }, ...s.eventLog] }
      }),
    setIdleMinutes: (m) => set({ idleMinutes: m }),
    setVacationOpt: (k, v) => set((s) => ({ vacationOpts: { ...s.vacationOpts, [k]: v } })),
    setDoorLocked: (v, by = 'alexey') => { set({ doorLocked: v }); toast(v ? t('Front door locked') : t('Front door unlocked'), by) },
    logEvent: (x) => log(x),
    setCamPeek: (v, by = 'alexey') => { set({ camPeek: v }); toast(v ? t('Living room camera on for 10 min') : t('Living room camera off'), by, false); log(v ? t('Living room camera turned on for 10 min by Alexey') : t('Living room camera turned off')) },
    setAddFlow: (patch) => set((s) => ({ addFlow: { ...s.addFlow, ...patch } })),
    addDevice: (d) => { set((s) => ({ addedDevices: [...s.addedDevices, { ...d, id: ++deviceId, on: false }] })); log(t('{name} added to {room}', { name: d.name, room: ROOM_NAMES[d.room] })) },
    toggleAdded: (id, on, by = 'tablet') => {
      set((s) => ({ addedDevices: s.addedDevices.map((d) => (d.id === id ? { ...d, on } : d)) }))
      const d = get().addedDevices.find((x) => x.id === id)
      if (d) toast(on ? t('{name} turned on', { name: d.name }) : t('{name} turned off', { name: d.name }), by)
    },

    saveScene: (id, values) => {
      set((s) => ({ scenes: { ...s.scenes, [id]: values } }))
      toast(t('{name} saved', { name: SCENES[id].name }), 'alexey')
    },

    saveToScene: (keys, by = 'alexey') => {
      const s = get()
      const id = s.activeScene
      if (!id || !keys.length) return
      const next = { ...s.scenes[id] }
      for (const k of keys) next[k] = s.devices[k]
      set({ scenes: { ...s.scenes, [id]: next } })
      toast(t('{n} saved to {name}', { n: keys.length, name: SCENES[id].name }), by)
    },

    setPrivate: (room, key, value, by = 'tablet') => {
      if (key === 'light') releaseHold(room)
      set((s) => ({ privateRooms: { ...s.privateRooms, [room]: { ...s.privateRooms[room], [key]: value } } }))
      if (key === 'light' || key === 'humidifier') toast(key === 'light' ? (value ? t('Light turned on') : t('Light turned off')) : (value ? t('Humidifier turned on') : t('Humidifier turned off')), by)
    },
    toggleExtra: (key, on) => set((s) => ({ extras: { ...s.extras, [key]: on } })),
    toggleWindow: (room) => set((s) => ({ windowsOpen: { ...s.windowsOpen, [room]: !s.windowsOpen[room] } })),
    setFailKeys: (keys) => set({ failKeys: keys }),
    setFreezeProgress: (v) => set({ freezeProgress: v }),
    resumeProgress: () => {
      set((st) => ({ dialogs: Object.fromEntries(ALL.map((d) => [d, st.dialogs[d]?.type === 'progress' ? { ...(st.dialogs[d] as Extract<DialogState, { type: 'progress' }>), holding: false } : st.dialogs[d]])) as Record<DeviceId, DialogState | null> }))
      gate?.()
    },
    reset: () => { runToken++; gate?.(); gate = null; set({ ...initialState() }) },
  }
})

/**
 * Смена языка: тексты, которые хранятся готовой строкой (журнал событий, всплывающие сообщения,
 * заголовки окон прогресса, названия добавленных устройств), переводятся на новый язык,
 * чтобы после переключения на экране не осталось строк на старом языке.
 */
useLang.subscribe((now, before) => {
  if (now.lang === before.lang) return
  const to = now.lang
  const tr = (x: string) => retranslate(x, to)
  useHome.setState((s) => ({
    eventLog: s.eventLog.map((e) => ({ ...e, x: tr(e.x) })),
    toasts: Object.fromEntries(Object.entries(s.toasts).map(([k, v]) => [k, v && { ...v, text: tr(v.text) }])) as HomeState['toasts'],
    dialogs: Object.fromEntries(Object.entries(s.dialogs).map(([k, d]) => [k, d && d.type === 'progress' ? { ...d, title: tr(d.title), doneTitle: tr(d.doneTitle) } : d])) as HomeState['dialogs'],
    addedDevices: s.addedDevices.map((d) => ({ ...d, name: tr(d.name) })),
  }))
})
