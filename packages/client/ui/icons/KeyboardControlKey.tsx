import type {SVGProps} from 'react'
import {cn} from '../cn'

const KeyboardControlKey = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='m5 12 1.41 1.41L12 7.83l5.59 5.58L19 12l-7-7z' />
  </svg>
)

export default KeyboardControlKey
