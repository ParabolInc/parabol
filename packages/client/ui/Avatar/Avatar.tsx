import * as AvatarPrimitive from '@radix-ui/react-avatar'
import {cn} from '../cn'
import {forwardRadix} from '../forwardRadix'

export const Avatar = forwardRadix<typeof AvatarPrimitive.Root>(({className, ...props}, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn('relative flex shrink-0 overflow-hidden rounded-full', className)}
    {...props}
  />
))

Avatar.displayName = AvatarPrimitive.Root.displayName
