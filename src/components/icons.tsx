import type { ReactElement, SVGProps } from 'react'

export type IconProps = SVGProps<SVGSVGElement>

export function CloneWebsiteIcon(props: IconProps): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M3.5 8.5h17" />
      <path d="M7 6.5h.01M9.5 6.5h.01" />
      <path d="m10 12 2 2-2 2M14 16h3" />
    </svg>
  )
}
