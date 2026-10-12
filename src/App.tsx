const swatches = [
  ['surface-0', 'Фон'], ['surface-1', 'Карточка'], ['surface-2', 'Карточка 2'], ['surface-3', 'Карточка 3'],
  ['accent-default', 'Акцент'], ['status-ok', 'OK'], ['status-warn', 'Внимание'], ['status-crit', 'Тревога'],
]

export function App() {
  return (
    <main style={{ padding: 'var(--space-32)' }}>
      <h1 style={{ fontSize: 30, fontWeight: 600, margin: '0 0 var(--space-24)' }}>HomeHub</h1>
      <div style={{ display: 'flex', gap: 'var(--space-16)', flexWrap: 'wrap' }}>
        {swatches.map(([token, label]) => (
          <div key={token} style={{ width: 120 }}>
            <div style={{ height: 64, borderRadius: 'var(--radius-control)', background: `var(--${token})` }} />
            <div style={{ marginTop: 8, color: 'var(--text-secondary)' }}>{label}</div>
          </div>
        ))}
      </div>
    </main>
  )
}
