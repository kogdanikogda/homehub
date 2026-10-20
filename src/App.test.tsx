// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { App } from './App'
import { useLang } from './i18n'
import { initialState, useHome } from './store/useHome'

beforeAll(() => {
  // в jsdom нет ResizeObserver, а рамки устройств следят за размером окна
  globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }
})
afterEach(() => { cleanup(); useLang.getState().setLang('en'); useHome.setState(initialState()) })

describe('главная страница', () => {
  it('открывается на настенном планшете, язык английский', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Settings & demo content' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Scene' })).toBeTruthy()
    expect(screen.queryByRole('group', { name: 'Marina’s phone' })).toBeNull()
    expect(document.documentElement.lang).toBe('en')
  })

  it('переключатель языка слева вверху меняет весь интерфейс и обратно', async () => {
    const user = userEvent.setup()
    render(<App />)
    const group = screen.getByRole('group', { name: 'Language' })
    expect(group).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'RU' }))
    expect(screen.getByRole('heading', { name: 'Сцена' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Настройки и демо-контент' })).toBeTruthy()
    expect(document.documentElement.lang).toBe('ru')
    await user.click(screen.getByRole('button', { name: 'EN' }))
    expect(screen.getByRole('heading', { name: 'Scene' })).toBeTruthy()
  })

  it('выбор устройства спрятан в меню настроек, кнопка — шестерёнка, в открытом меню — крестик', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    expect(screen.queryByRole('button', { name: 'Alexey’s phone' })).toBeNull()
    const gear = screen.getByRole('button', { name: 'Settings & demo content' })
    expect(gear.querySelector('svg')).toBeTruthy()
    expect(gear.getAttribute('aria-expanded')).toBe('false')
    await user.click(gear)
    // меню открыто: страница помечена, интерфейс остаётся на экране рядом с меню
    expect(container.firstElementChild?.hasAttribute('data-panel')).toBe(true)
    expect(screen.getByRole('heading', { name: 'Scene' })).toBeTruthy()
    const close = screen.getByRole('button', { name: 'Close settings' })
    expect(close.getAttribute('aria-expanded')).toBe('true')
    await user.click(screen.getByRole('button', { name: 'Alexey’s phone' }))
    expect(screen.getByRole('group', { name: 'Alexey’s phone' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Close settings' }))
    expect(screen.queryByRole('button', { name: 'Wall tablet' })).toBeNull()
  })

  it('клик вне меню его не закрывает, Esc закрывает', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Settings & demo content' }))
    // клик внутри меню его не закрывает
    await user.click(screen.getByRole('switch', { name: 'Device setup fails' }))
    expect(screen.getByRole('switch', { name: 'Device setup fails' }).getAttribute('aria-checked')).toBe('true')
    await user.click(screen.getByRole('heading', { name: 'Scene' }))
    expect(screen.getByRole('button', { name: 'Close settings' })).toBeTruthy()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('button', { name: 'Close settings' })).toBeNull()
  })

  it('экран тревоги: таймер, место, звук и кнопка; на русском тоже', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Settings & demo content' }))
    await user.click(screen.getByRole('button', { name: 'Smoke in the kitchen' }))
    const alert = screen.getByRole('alertdialog', { name: 'Smoke detected' })
    expect(alert.textContent).toMatch(/Alarm · 0:0\d/)
    expect(alert.textContent).toContain('Kitchen · smoke sensor')
    expect(alert.textContent).toContain('Alarm sound is on')
    await user.click(screen.getByRole('button', { name: 'RU' }))
    expect(screen.getByRole('alertdialog', { name: 'Обнаружен дым' }).textContent).toContain('Кухня · датчик дыма')
    await user.click(screen.getByRole('button', { name: 'Подтвердить' }))
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('экран сна: время, дата и температура, без режима, сцены и сигнализации', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Settings & demo content' }))
    await user.click(screen.getByRole('button', { name: 'Dim screen' }))
    const dim = screen.getByRole('button', { name: 'Wake the display' })
    expect(dim.textContent).toMatch(/\d+\.\d°C/)
    expect(dim.textContent).not.toMatch(/mode|Alarm|Scene/)
  })
})
