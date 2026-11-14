import type {HTMLAttributes} from 'react'
import {cn} from '../../ui/cn'

const LabelHeading = (props: HTMLAttributes<HTMLDivElement>) => {
  const {className, ...rest} = props
  return (
    <div
      {...rest}
      className={cn(
        'select-none font-semibold text-fg-secondary text-xs uppercase leading-4 tracking-[.03em]',
        className
      )}
    />
  )
}

export default LabelHeading
