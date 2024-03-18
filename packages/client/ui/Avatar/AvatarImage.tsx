import React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import clsx from 'clsx'

export const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({className, ...props}, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={clsx('aspect-square h-full w-full', className)}
    {...props}
  />
))

AvatarImage.displayName = AvatarPrimitive.Image.displayName
