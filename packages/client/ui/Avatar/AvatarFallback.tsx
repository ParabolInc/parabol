import * as AvatarPrimitive from '@radix-ui/react-avatar'
import {forwardRef} from 'react'
import {cn} from '../cn'

export const AvatarFallback = forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({className, ...props}, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      className
    )}
    {...props}
  />
))

AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName
