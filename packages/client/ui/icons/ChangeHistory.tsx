import type {SVGProps} from 'react'
import {cn} from '../cn'

const ChangeHistory = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M12 7.77 18.39 18H5.61zM12 4 2 20h20z' />
  </svg>
)

export default ChangeHistory
