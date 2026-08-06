import {forwardRef, type HTMLAttributes, type Ref} from 'react'
import {cn} from '../ui/cn'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'

const MenuItemAvatar = forwardRef(
  (props: HTMLAttributes<HTMLDivElement>, ref: Ref<HTMLDivElement>) => {
    const {className, ...rest} = props
    return (
      <MenuItemComponentAvatar
        ref={ref}
        className={cn('[&_svg]:block [&_svg]:h-[18px] [&_svg]:w-[18px]', className)}
        {...rest}
      />
    )
  }
)

export default MenuItemAvatar
