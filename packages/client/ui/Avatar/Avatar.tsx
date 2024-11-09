import * as AvatarPrimitive from '@radix-ui/react-avatar'
import clsx from 'clsx'
import {forwardRadix} from '../forwardRadix'

export const Avatar = forwardRadix<typeof AvatarPrimitive.Root>(({className, ...props}, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={clsx('relative flex shrink-0 overflow-hidden rounded-full', className)}
    {...props}
  />
))

Avatar.displayName = AvatarPrimitive.Root.displayName
