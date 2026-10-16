// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { initialState, useHome, whenIdle } from '../../store/useHome'
import { PhoneApp } from './PhoneApp'
import { CameraScreen } from './Security'

beforeEach(() => { useHome.setState({ ...initialState(), stepDelay: 0 }) })
afterEach(cleanup)

const noop = () => {}

describe('камера: Talk как в прототипе', () => {
  it('Talk есть только у камеры на входе', () => {
    for (const id of ['yard', 'garage', 'living'] as const) {
      const { unmount } = render(<CameraScreen id={id} onBack={noop} onOther={noop} />)
      expect(screen.queryByRole('button', { name: /talk/i })).toBeNull()
      unmount()
    }
    render(<CameraScreen id="entrance" onBack={noop} onOther={noop} />)
    expect(screen.getByRole('button', { name: 'Talk' })).toBeInTheDocument()
  })

  it('нажатие включает разговор: «Stop talking», плашка «Talking…», запись в журнале', () => {
    render(<CameraScreen id="entrance" onBack={noop} onOther={noop} />)
    fireEvent.click(screen.getByRole('button', { name: 'Talk' }))
    expect(screen.getByRole('button', { name: 'Stop talking' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Talking…')).toBeInTheDocument()
    expect(useHome.getState().eventLog[0].x).toBe('Two-way talk at the entrance')
  })

  it('повторное нажатие выключает разговор и не дублирует запись', () => {
    render(<CameraScreen id="entrance" onBack={noop} onOther={noop} />)
    fireEvent.click(screen.getByRole('button', { name: 'Talk' }))
    fireEvent.click(screen.getByRole('button', { name: 'Stop talking' }))
    expect(screen.getByRole('button', { name: 'Talk' })).toBeInTheDocument()
    expect(screen.queryByText('Talking…')).toBeNull()
    expect(useHome.getState().eventLog).toHaveLength(1)
  })

  it('смена камеры останавливает разговор', () => {
    const { rerender } = render(<CameraScreen id="entrance" onBack={noop} onOther={noop} />)
    fireEvent.click(screen.getByRole('button', { name: 'Talk' }))
    rerender(<CameraScreen id="yard" onBack={noop} onOther={noop} />)
    rerender(<CameraScreen id="entrance" onBack={noop} onOther={noop} />)
    expect(screen.getByRole('button', { name: 'Talk' })).toBeInTheDocument()
    expect(screen.queryByText('Talking…')).toBeNull()
  })

  it('Snapshot пишет в журнал и показывает сообщение', () => {
    render(<CameraScreen id="yard" onBack={noop} onOther={noop} />)
    fireEvent.click(screen.getByRole('button', { name: 'Snapshot' }))
    expect(screen.getByText('Snapshot saved to the event log.')).toBeInTheDocument()
    expect(useHome.getState().eventLog[0].x).toBe('Snapshot · Yard')
  })

  it('камера гостиной в режиме Home выключена: Snapshot недоступен', () => {
    render(<CameraScreen id="living" onBack={noop} onOther={noop} />)
    expect(screen.getByRole('button', { name: 'Snapshot' })).toBeDisabled()
  })
})

describe('телефон: шапка и экраны', () => {
  it('внутренний экран: «назад» над единственным заголовком', () => {
    render(<PhoneApp user="alexey" />)
    fireEvent.click(screen.getByRole('button', { name: 'Rooms' }))
    fireEvent.click(screen.getByRole('button', { name: /Living Room/ }))
    expect(screen.getAllByRole('heading', { name: 'Living Room' })).toHaveLength(1)
    const back = screen.getByRole('button', { name: /All rooms/ })
    fireEvent.click(back)
    expect(screen.queryByRole('button', { name: /All rooms/ })).toBeNull()
    expect(screen.getByRole('heading', { name: 'Rooms' })).toBeInTheDocument()
  })

  it('страница комнаты: «Full light» под списком, возврат на том же месте', () => {
    useHome.setState({ overrideAck: true })
    render(<PhoneApp user="alexey" />)
    fireEvent.click(screen.getByRole('button', { name: 'Rooms' }))
    fireEvent.click(screen.getByRole('button', { name: /Living Room/ }))
    fireEvent.click(screen.getByRole('button', { name: /Full light/ }))
    expect(useHome.getState().devices['living.light']).toBe(100)
    expect(screen.queryByRole('button', { name: /^Full light$/ })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Back to previous light/ }))
    expect(useHome.getState().devices['living.light']).toBe(80)
  })

  it('личная комната: кнопка есть, пока свет выключен', () => {
    render(<PhoneApp user="marina" />)
    fireEvent.click(screen.getByRole('button', { name: 'Rooms' }))
    fireEvent.click(screen.getByRole('button', { name: /Kids Room 2/ }))
    expect(screen.getByRole('button', { name: /Full light/ })).toBeInTheDocument()
  })

  it('дашборд: в карточке Scene нет дубля названия активной сцены', () => {
    render(<PhoneApp user="marina" />)
    const card = screen.getByText('Scene').closest('section')!
    expect(within(card).getAllByText('General')).toHaveLength(1)
  })

  it('дашборд: сцена включается на месте, без перехода на Scenes', async () => {
    render(<PhoneApp user="marina" />)
    fireEvent.click(screen.getByRole('button', { name: /Cinema/ }))
    await act(async () => { await whenIdle() })
    expect(useHome.getState().activeScene).toBe('cinema')
    expect(screen.getByText('Scene')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page')
  })

  it('дашборд: повторный тап по активной сцене ничего не делает', () => {
    render(<PhoneApp user="marina" />)
    fireEvent.click(screen.getByRole('button', { name: /General/ }))
    expect(useHome.getState().dialogs.marina).toBeNull()
  })

  it('плитка Windows открывает шторку: 5 окон, без иконок', () => {
    render(<PhoneApp user="marina" />)
    fireEvent.click(screen.getByRole('button', { name: /Windows/ }))
    const dlg = screen.getByRole('dialog')
    expect(within(dlg).getByText('All 5 windows are closed.')).toBeInTheDocument()
    expect(within(dlg).queryByText('Corridor')).toBeNull()
    expect(within(dlg).getAllByText('Closed')).toHaveLength(5)
    expect(dlg.querySelectorAll('svg').length).toBeLessThanOrEqual(1)
  })

  it('подписи комнат: «1 of 6 devices on»', () => {
    render(<PhoneApp user="marina" />)
    expect(screen.getByText('1 of 6 devices on')).toBeInTheDocument()
    expect(screen.getByText('1 device on')).toBeInTheDocument()
    expect(screen.getAllByText('All devices off').length).toBeGreaterThan(0)
  })
})
