/* DEPRECATED. SEE DropdownToggleV2 */

import {type ComponentPropsWithoutRef, forwardRef, type ReactElement, type Ref} from 'react'
import {ExpandMore} from '~/ui/icons'
import {cn} from '../ui/cn'

const sizeStyles = {
  small: 'text-[0.875rem] leading-5 px-[0.4375rem] py-[0.3125rem]',
  medium: 'text-[0.9375rem] leading-6 px-[0.6875rem] py-[0.4375rem]',
  large: 'text-[1rem] leading-7 px-[0.9375rem] py-[0.6875rem]'
} as const

interface Props extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  className?: string
  defaultText: string | ReactElement<any>
  disabled?: boolean
  // style hacks until a better pattern
  flat?: boolean
  size?: 'small' | 'medium' | 'large'
}

const DropdownMenuToggle = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {className, onClick, defaultText, disabled, flat, size, ...rest} = props
  return (
    <div
      className={cn('mx-auto my-0 inline-block w-full max-w-full', className)}
      ref={ref}
      onClick={disabled ? undefined : onClick}
      {...rest}
    >
      <div
        className={cn(
          'relative flex w-full cursor-pointer select-none appearance-none items-center rounded border bg-surface-input font-sans text-fg-primary outline-none selection:bg-hairline-strong',
          sizeStyles[size || 'medium'],
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'hover:border-fg-primary focus:border-fg-primary active:border-fg-primary',
          flat ? 'border-transparent' : 'border-hairline-field'
        )}
        tabIndex={0}
      >
        <span className='flex min-w-0 flex-1'>{defaultText}</span>
        {!disabled && <ExpandMore className='ml-2 text-fg-secondary' />}
      </div>
    </div>
  )
})

export default DropdownMenuToggle
