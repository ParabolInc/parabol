import type {SVGProps} from 'react'
import {cn} from '../cn'

const PlayArrow = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M8 5v14l11-7z' />
  </svg>
)

export default PlayArrow
