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
    expect(screen.getByRole('button', { name: 'Service panel' })).toBeTruthy()
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
    expect(screen.getByRole('button', { name: 'Сервисная панель' })).toBeTruthy()
    expect(document.documentElement.lang).toBe('ru')
    await user.click(screen.getByRole('button', { name: 'EN' }))
    expect(screen.getByRole('heading', { name: 'Scene' })).toBeTruthy()
  })

  it('выбор устройства спрятан в сервисной панели, кнопка вызова — шестерёнка', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.queryByRole('button', { name: 'Alexey’s phone' })).toBeNull()
    const gear = screen.getByRole('button', { name: 'Service panel' })
    expect(gear.querySelector('svg')).toBeTruthy()
    await user.click(gear)
    await user.click(screen.getByRole('button', { name: 'Alexey’s phone' }))
    expect(screen.getByRole('group', { name: 'Alexey’s phone' })).toBeTruthy()
  })
})
