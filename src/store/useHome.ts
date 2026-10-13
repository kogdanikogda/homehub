import { create } from 'zustand'
import {
  DEVICE_BY_KEY, INITIAL_EXTRAS, INITIAL_PRIVATE, MODE_NAMES, PROTOTYPE_PIN, ROOM_ORDER, SCENES, awayValues, type DeviceValues,
} from './data'
import { conflictTurnOff, diffToScene, modifiedChanges } from './logic'
import type { AlertKind, DeviceId, OnboardingStep, ExtraKey, DeviceKey, DeviceValue, DialogState, Mode, PrivateRoomId, PrivateRooms, PrivateState, ProgressItem, RoomId, SceneId } from './types'

type Toast = { id: number; text: string } | null

type Windows = Record<RoomId, boolean>

export interface HomeState {
  mode: Mode
  devices: DeviceValues
  activeScene: SceneId | null
  /** Предупреждение о правке сцены показывается один раз за активацию */
  overrideAck: boolean
  /** Устройства, не ответившие при активации сцены */
  unresponsive: DeviceKey[]
  windowsOpen: Windows
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
  alert: { kind: AlertKind; at: string } | null
  /** Для прототипа: какие устройства «не ответят» при следующей сцене */
  failKeys: DeviceKey[]
  /** Пауза между шагами прогресса, мс (в тестах 0) */
  stepDelay: number

  toggleExtra: (key: ExtraKey, on: boolean) => void
  setPrivate: <K extends keyof PrivateState>(room: PrivateRoomId, key: K, value: PrivateState[K], by?: DeviceId) => void
  setDevice: (key: DeviceKey, value: DeviceValue, by?: DeviceId) => void
  confirmOverride: (by?: DeviceId) => void
  tapScene: (id: SceneId, by?: DeviceId) => void
  confirmConflict: (by?: DeviceId) => void
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
  showToast: (text: string, by?: DeviceId) => void
  clearToast: (id: number, by?: DeviceId) => void
  dim: () => void
  wake: () => void
  triggerAlert: (kind: AlertKind) => void
  acknowledgeSmoke: () => void
  requestAlarmOff: (by?: DeviceId) => void
  toggleWindow: (room: RoomId) => void
  setFailKeys: (keys: DeviceKey[]) => void
  reset: () => void
}

const closedWindows = (): Windows => Object.fromEntries(ROOM_ORDER.map((r) => [r, false])) as Windows

export const initialState = () => ({
  mode: 'home' as Mode,
  devices: { ...SCENES.general.values } as DeviceValues,
  activeScene: 'general' as SceneId | null,
  overrideAck: false,
  unresponsive: [] as DeviceKey[],
  windowsOpen: closedWindows(),
  privateRooms: structuredClone(INITIAL_PRIVATE) as PrivateRooms,
  extras: { ...INITIAL_EXTRAS },
  dialogs: { tablet: null, marina: null, alexey: null } as Record<DeviceId, DialogState | null>,
  onboarding: null as OnboardingStep | null,
  declinePairing: false,
  toasts: { tablet: null, marina: null, alexey: null } as Record<DeviceId, Toast>,
  dimmed: false,
  alert: null as HomeState['alert'],
  failKeys: [] as DeviceKey[],
  stepDelay: 450,
})

let runToken = 0
let toastId = 0
let lastRun: Promise<void> = Promise.resolve()
/** Для тестов: дождаться окончания прогресса сцены */
export const whenIdle = () => lastRun

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const nowHHMM = () => new Date().toTimeString().slice(0, 5)

export const useHome = create<HomeState>()((set, get) => {
  const toast = (text: string, by: DeviceId = 'tablet') =>
    set((s) => ({ toasts: { ...s.toasts, [by]: { id: ++toastId, text } } }))
  const setDialog = (by: DeviceId, d: DialogState | null) =>
    set((s) => ({ dialogs: { ...s.dialogs, [by]: d } }))
  const dialogOf = (by: DeviceId) => get().dialogs[by]

  const apply = (key: DeviceKey, value: DeviceValue, by: DeviceId) => {
    set((s) => ({ devices: { ...s.devices, [key]: value } }))
    const def = DEVICE_BY_KEY[key]
    if (def.kind === 'toggle') toast(`${def.short} turned ${value ? 'on' : 'off'}`, by)
  }

  const runScene = (id: SceneId, by: DeviceId): Promise<void> => {
    const token = ++runToken
    const items: ProgressItem[] = diffToScene(get().devices, id).map((c) => ({ ...c, status: 'waiting' }))
    setDialog(by, { type: 'progress', scene: id, items, phase: 'running' })

    const publish = (next: ProgressItem[], phase: 'running' | 'done' | 'failed') =>
      setDialog(by, { type: 'progress', scene: id, items: next, phase })

    const job = (async () => {
      const work = [...items]
      for (let i = 0; i < work.length; i++) {
        work[i] = { ...work[i], status: 'running' }
        publish([...work], 'running')
        await sleep(get().stepDelay)
        if (token !== runToken) return
        work[i] = { ...work[i], status: get().failKeys.includes(work[i].key) ? 'failed' : 'done' }
        publish([...work], 'running')
      }
      const failed = work.filter((w) => w.status === 'failed').map((w) => w.key)
      const target = SCENES[id].values
      set((s) => ({
        devices: Object.fromEntries(
          Object.entries(s.devices).map(([k, v]) => [k, work.some((w) => w.key === k && w.status === 'done') ? target[k as DeviceKey] : v]),
        ) as DeviceValues,
        activeScene: id,
        overrideAck: false,
        unresponsive: failed,
      }))
      publish(work, failed.length ? 'failed' : 'done')
      if (!failed.length) {
        await sleep(get().stepDelay * 3)
        if (token === runToken && dialogOf(by)?.type === 'progress') setDialog(by, null)
      }
    })()
    lastRun = job
    return job
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
        if (modifiedChanges(s.devices, s.activeScene, s.unresponsive).length) setDialog(by, { type: 'changes', scene: id })
        return
      }
      const turnOff = conflictTurnOff(s.devices, s.activeScene, id)
      if (turnOff.length) setDialog(by, { type: 'conflict', target: id, turnOff })
      else void runScene(id, by)
    },

    confirmConflict: (by = 'tablet') => {
      const d = dialogOf(by)
      if (d?.type === 'conflict') void runScene(d.target, by)
    },

    resetToScene: (by = 'tablet') => {
      const s = get()
      if (!s.activeScene) return
      set({ devices: { ...s.devices, ...SCENES[s.activeScene].values }, unresponsive: [] })
      setDialog(by, null)
      toast(`${SCENES[s.activeScene].name} restored`, by)
    },

    requestAway: (by = 'tablet') => {
      const windows = ROOM_ORDER.filter((r) => get().windowsOpen[r])
      setDialog(by, { type: 'confirmAway', windows })
    },

    confirmAway: (by = 'tablet') => {
      set((s) => ({ mode: 'away', devices: awayValues(s.devices), activeScene: null, overrideAck: false, unresponsive: [] }))
      setDialog(by, null)
      toast(`${MODE_NAMES.away} mode is on`, by)
    },

    enterVacation: (by = 'alexey') => {
      set((s) => ({ mode: 'vacation', devices: awayValues(s.devices), activeScene: null, overrideAck: false, unresponsive: [] }))
      setDialog(by, null)
      toast(`${MODE_NAMES.vacation} mode is on`, by)
    },

    // На телефоне человек уже вошёл в приложение, поэтому PIN нужен только на общей панели
    requestHome: (by = 'tablet') => {
      if (by === 'tablet') setDialog(by, { type: 'pin', purpose: 'home' })
      else {
        set({ mode: 'home' })
        void runScene('general', by)
      }
    },

    submitPin: (pin, by = 'tablet') => {
      const d = dialogOf(by)
      if (d?.type !== 'pin' || pin !== PROTOTYPE_PIN) return false
      if (d.purpose === 'home') {
        // Возврат из Away/Vacation всегда включает сцену General
        set({ mode: 'home' })
        setDialog(by, null)
        void runScene('general', by)
      } else {
        set({ alert: null })
        setDialog(by, null)
        toast('Alarm turned off', by)
      }
      return true
    },

    openWindows: (by = 'tablet') => setDialog(by, { type: 'windows' }),
    setOnboarding: (step) => set({ onboarding: step }),
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

    triggerAlert: (kind) => set((s) => ({ alert: { kind, at: nowHHMM() }, dimmed: false, dialogs: { ...s.dialogs, tablet: null } })),
    acknowledgeSmoke: () => set({ alert: null }),
    requestAlarmOff: (by = 'tablet') => setDialog(by, { type: 'pin', purpose: 'alarm' }),

    setPrivate: (room, key, value, by = 'tablet') => {
      set((s) => ({ privateRooms: { ...s.privateRooms, [room]: { ...s.privateRooms[room], [key]: value } } }))
      if (key === 'light' || key === 'humidifier') toast(`${key === 'light' ? 'Light' : 'Humidifier'} turned ${value ? 'on' : 'off'}`, by)
    },
    toggleExtra: (key, on) => set((s) => ({ extras: { ...s.extras, [key]: on } })),
    toggleWindow: (room) => set((s) => ({ windowsOpen: { ...s.windowsOpen, [room]: !s.windowsOpen[room] } })),
    setFailKeys: (keys) => set({ failKeys: keys }),
    reset: () => { runToken++; set({ ...initialState() }) },
  }
})
