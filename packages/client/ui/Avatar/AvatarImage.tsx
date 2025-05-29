import * as AvatarPrimitive from '@radix-ui/react-avatar'
import {forwardRef} from 'react'
import {cn} from '../cn'

export const AvatarImage = forwardRef<
  HTMLImageElement,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({className, ...props}, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
))

AvatarImage.displayName = AvatarPrimitive.Image.displayName
