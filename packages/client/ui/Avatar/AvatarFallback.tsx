import * as AvatarPrimitive from '@radix-ui/react-avatar'
import clsx from 'clsx'
import {forwardRef} from 'react'

export const AvatarFallback = forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({className, ...props}, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={clsx(
      'bg-muted flex h-full w-full items-center justify-center rounded-full',
      className
    )}
    {...props}
  />
))

AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName
