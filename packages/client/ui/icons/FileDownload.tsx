import type {SVGProps} from 'react'
import {cn} from '../cn'

const FileDownload = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M19 9h-4V3H9v6H5l7 7zM5 18v2h14v-2z' />
  </svg>
)

export default FileDownload
