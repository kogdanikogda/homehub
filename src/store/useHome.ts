import { create } from 'zustand'
import {
  DEVICE_BY_KEY, INITIAL_EXTRAS, MODE_NAMES, PROTOTYPE_PIN, ROOM_ORDER, SCENES, awayValues, type DeviceValues,
} from './data'
import { conflictTurnOff, diffToScene, modifiedChanges } from './logic'
import type { AlertKind, OnboardingStep, ExtraKey, DeviceKey, DeviceValue, DialogState, Mode, ProgressItem, RoomId, SceneId } from './types'

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
  /** Кухонные устройства вне сцен */
  extras: Record<ExtraKey, boolean>
  dialog: DialogState | null
  /** Первая настройка панели; null — панель уже настроена */
  onboarding: OnboardingStep | null
  /** Для прототипа: владелец отклонит запрос на сопряжение */
  declinePairing: boolean
  toast: { id: number; text: string } | null
  dimmed: boolean
  alert: { kind: AlertKind; at: string } | null
  /** Для прототипа: какие устройства «не ответят» при следующей сцене */
  failKeys: DeviceKey[]
  /** Пауза между шагами прогресса, мс (в тестах 0) */
  stepDelay: number

  toggleExtra: (key: ExtraKey, on: boolean) => void
  setDevice: (key: DeviceKey, value: DeviceValue) => void
  confirmOverride: () => void
  tapScene: (id: SceneId) => void
  confirmConflict: () => void
  resetToScene: () => void
  requestAway: () => void
  confirmAway: () => void
  /** Включается админом с телефона; на публичной панели недоступно */
  enterVacation: () => void
  requestHome: () => void
  /** true — PIN верный */
  submitPin: (pin: string) => boolean
  openWindows: () => void
  setOnboarding: (step: OnboardingStep | null) => void
  setDeclinePairing: (v: boolean) => void
  openEnergy: () => void
  closeDialog: () => void
  showToast: (text: string) => void
  clearToast: (id: number) => void
  dim: () => void
  wake: () => void
  triggerAlert: (kind: AlertKind) => void
  acknowledgeSmoke: () => void
  requestAlarmOff: () => void
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
  extras: { ...INITIAL_EXTRAS },
  dialog: null as DialogState | null,
  onboarding: null as OnboardingStep | null,
  declinePairing: false,
  toast: null as HomeState['toast'],
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
  const toast = (text: string) => set({ toast: { id: ++toastId, text } })

  const apply = (key: DeviceKey, value: DeviceValue) => {
    set((s) => ({ devices: { ...s.devices, [key]: value } }))
    const def = DEVICE_BY_KEY[key]
    if (def.kind === 'toggle') toast(`${def.short} turned ${value ? 'on' : 'off'}`)
  }

  const runScene = (id: SceneId): Promise<void> => {
    const token = ++runToken
    const items: ProgressItem[] = diffToScene(get().devices, id).map((c) => ({ ...c, status: 'waiting' }))
    set({ dialog: { type: 'progress', scene: id, items, phase: 'running' } })

    const publish = (next: ProgressItem[], phase: 'running' | 'done' | 'failed') =>
      set({ dialog: { type: 'progress', scene: id, items: next, phase } })

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
        if (token === runToken && get().dialog?.type === 'progress') set({ dialog: null })
      }
    })()
    lastRun = job
    return job
  }

  return {
    ...initialState(),

    setDevice: (key, value) => {
      const s = get()
      if (s.devices[key] === value) return
      if (s.mode === 'home' && s.activeScene && !s.overrideAck) {
        set({ dialog: { type: 'override', key, from: s.devices[key], to: value, scene: s.activeScene } })
        return
      }
      apply(key, value)
    },

    confirmOverride: () => {
      const d = get().dialog
      if (d?.type !== 'override') return
      apply(d.key, d.to)
      set({ overrideAck: true, dialog: null })
    },

    tapScene: (id) => {
      const s = get()
      if (s.mode !== 'home') return
      if (id === s.activeScene) {
        if (modifiedChanges(s.devices, s.activeScene, s.unresponsive).length) set({ dialog: { type: 'changes', scene: id } })
        return
      }
      const turnOff = conflictTurnOff(s.devices, s.activeScene, id)
      if (turnOff.length) set({ dialog: { type: 'conflict', target: id, turnOff } })
      else void runScene(id)
    },

    confirmConflict: () => {
      const d = get().dialog
      if (d?.type === 'conflict') void runScene(d.target)
    },

    resetToScene: () => {
      const s = get()
      if (!s.activeScene) return
      set({ devices: { ...s.devices, ...SCENES[s.activeScene].values }, dialog: null, unresponsive: [] })
      toast(`${SCENES[s.activeScene].name} restored`)
    },

    requestAway: () => {
      const windows = ROOM_ORDER.filter((r) => get().windowsOpen[r])
      set({ dialog: { type: 'confirmAway', windows } })
    },

    confirmAway: () => {
      set((s) => ({
        mode: 'away', devices: awayValues(s.devices), activeScene: null, overrideAck: false, unresponsive: [], dialog: null,
      }))
      toast(`${MODE_NAMES.away} mode is on`)
    },

    enterVacation: () => {
      set((s) => ({
        mode: 'vacation', devices: awayValues(s.devices), activeScene: null, overrideAck: false, unresponsive: [], dialog: null,
      }))
      toast(`${MODE_NAMES.vacation} mode is on`)
    },

    requestHome: () => set({ dialog: { type: 'pin', purpose: 'home' } }),

    submitPin: (pin) => {
      const d = get().dialog
      if (d?.type !== 'pin' || pin !== PROTOTYPE_PIN) return false
      if (d.purpose === 'home') {
        // Возврат из Away/Vacation всегда включает сцену General
        set({ mode: 'home', dialog: null })
        void runScene('general')
      } else {
        set({ alert: null, dialog: null })
        toast('Alarm turned off')
      }
      return true
    },

    openWindows: () => set({ dialog: { type: 'windows' } }),
    setOnboarding: (step) => set({ onboarding: step }),
    setDeclinePairing: (v) => set({ declinePairing: v }),
    openEnergy: () => set({ dialog: { type: 'energy' } }),
    closeDialog: () => {
      runToken++ // закрытие окна прогресса не отменяет сцену, но останавливает автозакрытие
      set({ dialog: null })
    },
    showToast: toast,
    clearToast: (id) => set((s) => (s.toast?.id === id ? { toast: null } : s)),
    dim: () => set({ dimmed: true }),
    wake: () => set({ dimmed: false }),

    triggerAlert: (kind) => set({ alert: { kind, at: nowHHMM() }, dimmed: false, dialog: null }),
    acknowledgeSmoke: () => set({ alert: null }),
    requestAlarmOff: () => set({ dialog: { type: 'pin', purpose: 'alarm' } }),

    toggleExtra: (key, on) => set((s) => ({ extras: { ...s.extras, [key]: on } })),
    toggleWindow: (room) => set((s) => ({ windowsOpen: { ...s.windowsOpen, [room]: !s.windowsOpen[room] } })),
    setFailKeys: (keys) => set({ failKeys: keys }),
    reset: () => { runToken++; set({ ...initialState() }) },
  }
})
