import {forwardRef, type ImgHTMLAttributes, type Ref} from 'react'
import {cn} from '../ui/cn'

const MenuAvatar = forwardRef(
  (props: ImgHTMLAttributes<HTMLImageElement>, ref: Ref<HTMLImageElement>) => {
    const {className, ...rest} = props
    return <img ref={ref} className={cn('mr-2 h-6 w-6 rounded-full', className)} {...rest} />
  }
)

export default MenuAvatar
