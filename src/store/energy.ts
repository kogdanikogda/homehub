export type EnergyPeriod = 'day' | 'week' | 'month'

export interface EnergyData {
  /** Сколько всего, кВт·ч */
  total: number
  /** Подпись под числом */
  caption: string
  /** Сравнение с прошлым периодом: процент и «меньше/больше» */
  compare: { percent: number; less: boolean; text: string }
  /** Столбики графика, кВт·ч */
  bars: number[]
  /** Верх шкалы графика, кВт·ч */
  axisMax: number
  /** Куда уходит энергия (по категориям, не по комнатам), кВт·ч */
  split: { label: string; icon: 'temp' | 'light' | 'tv' | 'bolt'; value: number }[]
}

const split = (a: number, b: number, c: number, d: number): EnergyData['split'] => [
  { label: 'Climate & floor heating', icon: 'temp', value: a },
  { label: 'Lighting', icon: 'light', value: b },
  { label: 'TV & sound', icon: 'tv', value: c },
  { label: 'Kitchen & other', icon: 'bolt', value: d },
]

// Числа взяты из макета (вкладки Day / Week / Month)
export const ENERGY: Record<EnergyPeriod, EnergyData> = {
  day: {
    total: 18.4,
    caption: 'Today so far',
    compare: { percent: 8, less: true, text: '8% less than yesterday by this time' },
    axisMax: 3,
    bars: [0.49, 0.44, 0.42, 0.41, 0.43, 0.51, 0.91, 1.54, 1.38, 0.83, 0.68, 0.64, 0.72, 0.77, 0.7, 0.67, 0.86, 1.41, 2.17, 2.4],
    split: split(8.6, 3.9, 2.0, 3.9),
  },
  week: {
    total: 167.5,
    caption: 'Last 7 days',
    compare: { percent: 5, less: true, text: '5% less than the week before' },
    axisMax: 30,
    bars: [24.1, 27.8, 29.3, 22.6, 21.9, 23.4, 18.4],
    split: split(83.8, 31.8, 20.1, 31.8),
  },
  month: {
    total: 727.4,
    caption: 'Last 30 days',
    compare: { percent: 3, less: false, text: '3% more than the 30 days before' },
    axisMax: 30,
    bars: [24, 27, 24, 26, 30, 26, 22, 23, 27, 25, 26, 28, 25, 22, 20, 23, 25, 25, 25, 25, 24, 20, 22, 25, 27, 24, 23, 25, 21, 18.4],
    split: split(378.2, 130.9, 80.0, 138.2),
  },
}

export const percentOf = (value: number, total: number) => Math.round((value / total) * 100)

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Подписи под столбиками: индекс столбика → текст */
export function axisLabels(period: EnergyPeriod, now: Date): Map<number, string> {
  const labels = new Map<number, string>()
  const back = (n: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - n)
  if (period === 'day') for (let h = 0; h < 24; h += 3) labels.set(h, String(h).padStart(2, '0'))
  if (period === 'week') for (let i = 0; i < 7; i++) labels.set(i, i === 6 ? 'Today' : DAY_NAMES[back(6 - i).getDay()])
  if (period === 'month') {
    for (const i of [0, 7, 14, 21]) { const d = back(29 - i); labels.set(i, `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`) }
    labels.set(29, 'Today')
  }
  return labels
}
