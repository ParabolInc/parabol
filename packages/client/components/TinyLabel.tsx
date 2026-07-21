import type {ComponentPropsWithoutRef} from 'react'
import {cn} from '../ui/cn'

const TinyLabel = (props: ComponentPropsWithoutRef<'label'>) => {
  const {className, ...rest} = props
  return <label className={cn('text-[11px] text-fg-secondary', className)} {...rest} />
}

export default TinyLabel
