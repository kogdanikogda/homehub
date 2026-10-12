// Проверка контраста WCAG для пар «текст на фоне» из токенов.
// Запуск: node scripts/contrast.mjs
const c = {
  'surface-0': '#0b0b0b', 'surface-1': '#171717', 'surface-2': '#242424', 'surface-3': '#333333',
  'text-primary': '#dedcd7', 'text-secondary': '#a3a19c', 'text-tertiary': '#8f8d89', 'text-disabled': '#5c5b58',
  'text-on-light': '#0b0b0b', 'static-white': '#ffffff',
  'accent-300': '#dcba9a', 'accent-400': '#c5957d', 'accent-950': '#1c110c', 'accent-soft': '#322e2c',
  'status-ok': '#97bc9d', 'status-warn': '#ceb885', 'status-crit': '#dc8995', 'status-info': '#90b7d3',
}
const lin = (v) => (v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
const L = (h) => { const n = parseInt(h.slice(1), 16); return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255) }
const ratio = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }
// [текст, фон, мелкий текст?]
const pairs = [
  ['text-primary', 'surface-0'], ['text-primary', 'surface-1'], ['text-primary', 'surface-2'], ['text-primary', 'surface-3'],
  ['text-secondary', 'surface-0'], ['text-secondary', 'surface-1'], ['text-secondary', 'surface-2'], ['text-secondary', 'surface-3'],
  ['text-tertiary', 'surface-0'], ['text-tertiary', 'surface-1'], ['text-tertiary', 'surface-2'],
  ['accent-300', 'accent-soft'], ['accent-300', 'surface-3'], ['accent-300', 'surface-1'],
  ['accent-950', 'accent-300'], ['accent-950', 'accent-400'],
  ['text-on-light', 'text-primary'], ['text-on-light', 'static-white'],
  ['status-ok', 'surface-1'], ['status-warn', 'surface-1'], ['status-crit', 'surface-1'], ['status-info', 'surface-1'],
  ['status-warn', 'surface-0'], ['text-disabled', 'surface-1'],
]
let bad = 0
for (const [f, b] of pairs) {
  const r = ratio(c[f], c[b])
  const ok = r >= 4.5
  if (!ok) bad++
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${r.toFixed(2).padStart(5)}  ${f} на ${b}`)
}
console.log(bad ? `\nНиже 4.5: ${bad} (text-disabled — отключённые элементы, WCAG их не требует)` : '\nВсе пары проходят 4.5')
