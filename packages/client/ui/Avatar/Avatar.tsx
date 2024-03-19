import React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import clsx from 'clsx'

export const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({className, ...props}, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={clsx('relative flex shrink-0 overflow-hidden rounded-full', className)}
    {...props}
  />
))

Avatar.displayName = AvatarPrimitive.Root.displayName
