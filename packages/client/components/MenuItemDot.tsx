import {forwardRef, type Ref} from 'react'
import {cn} from '../ui/cn'

interface Props {
  color: string
  className?: string
}

const MenuItemDot = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {color, className} = props
  return (
    <div
      ref={ref}
      className={cn('mr-3 inline-block h-1.5 w-1.5 rounded-[6px]', className)}
      style={{backgroundColor: color}}
    />
  )
})

export default MenuItemDot
