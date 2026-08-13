import type {SVGProps} from 'react'
import {cn} from '../cn'

const FileUpload = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z' />
  </svg>
)

export default FileUpload
