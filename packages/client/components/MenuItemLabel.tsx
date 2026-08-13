import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import textOverflow from '../styles/helpers/textOverflow'
import {cn} from '../ui/cn'

export const MenuItemLabelStyle = {
  ...textOverflow,
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  fontSize: 14,
  lineHeight: '24px',
  padding: `4px 16px 4px 16px`
}

const MenuItemLabel = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>((props, ref) => {
  const {className, children, ...rest} = props
  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-1 items-center overflow-hidden text-ellipsis whitespace-nowrap px-4 py-1 text-sm leading-6',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
})

export default MenuItemLabel
