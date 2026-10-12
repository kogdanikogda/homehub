import { iconPaths, type IconName } from './paths'

type Props = { name: IconName; size?: number; className?: string }

/** Иконка из набора Figma. Цвет берётся от текста (currentColor). */
export function Icon({ name, size = 24, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {iconPaths[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

export type { IconName }
