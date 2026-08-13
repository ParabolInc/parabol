import type {SVGProps} from 'react'
import {cn} from '../cn'

const VideoFile = ({className, ...props}: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox='0 0 24 24'
    aria-hidden='true'
    focusable='false'
    {...props}
    className={cn(
      'inline-block h-[1em] w-[1em] shrink-0 select-none fill-current text-[24px]',
      className
    )}
  >
    <path d='M14 2H6.01c-1.1 0-2 .89-2 2L4 20c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8zm-1 7V3.5L18.5 9zm1 5 2-1.06v4.12L14 16v1c0 .55-.45 1-1 1H9c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h4c.55 0 1 .45 1 1z' />
  </svg>
)

export default VideoFile
