import {type ComponentPropsWithoutRef, forwardRef, type Ref} from 'react'
import {cn} from '../../ui/cn'

interface Props extends ComponentPropsWithoutRef<'div'> {
  narrow?: boolean
}

const SettingsWrapper = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {narrow, className, children, ...rest} = props
  return (
    <div
      ref={ref}
      className={cn(
        'mx-auto flex w-full flex-col',
        narrow ? 'max-w-[644px]' : 'max-w-3xl',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
})

export default SettingsWrapper
