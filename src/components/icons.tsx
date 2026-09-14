import type { JSX, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function Base(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  )
}

export function CircuitIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <path d="M8 4v3M16 4v3M8 17v3M16 17v3M4 8h3M4 16h3M17 8h3M17 16h3" />
      <circle cx="9" cy="9" r="1" />
      <circle cx="15" cy="15" r="1" />
    </Base>
  )
}

export function PhoneIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </Base>
  )
}

export function CpuIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="6" y="6" width="12" height="12" rx="1" />
      <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
    </Base>
  )
}

export function GpuIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="2" y="7" width="20" height="10" rx="1" />
      <circle cx="8" cy="12" r="2" />
      <circle cx="14" cy="12" r="2" />
      <path d="M2 10h1M2 14h1" />
    </Base>
  )
}

export function ConsoleIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6 9h12l2 9a2 2 0 0 1-2 2.5c-1.2 0-1.5-1-2.5-1H8.5c-1 0-1.3 1-2.5 1A2 2 0 0 1 4 18z" />
      <circle cx="8.5" cy="13" r="1" />
      <circle cx="16" cy="12" r="0.8" />
      <circle cx="17.5" cy="14" r="0.8" />
    </Base>
  )
}

export function CarIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 13l1.5-4.5A2 2 0 0 1 6.4 7h11.2a2 2 0 0 1 1.9 1.5L21 13" />
      <path d="M3 13h18v4a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
      <circle cx="7.5" cy="17.5" r="1.2" />
      <circle cx="16.5" cy="17.5" r="1.2" />
    </Base>
  )
}

export function PlaneIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M10.5 3.5l2 6.5 6-2 .8 1.6-6 3.2.8 4.7 2.4 1.4v1.6l-4-1-1 2h-1.5l-1-2-4 1v-1.6l2.4-1.4.8-4.7-6-3.2.8-1.6 6 2z" />
    </Base>
  )
}

export function MinerIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <path d="M4 9h16M4 14h16M9 4v16M14 4v16" />
    </Base>
  )
}

export const iconMap: Record<string, (props: IconProps) => JSX.Element> = {
  circuit: CircuitIcon,
  phone: PhoneIcon,
  cpu: CpuIcon,
  gpu: GpuIcon,
  console: ConsoleIcon,
  car: CarIcon,
  plane: PlaneIcon,
  miner: MinerIcon,
}
