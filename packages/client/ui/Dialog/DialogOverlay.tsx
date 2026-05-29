import * as RadixDialog from '@radix-ui/react-dialog'
import {motion} from 'motion/react'
import * as React from 'react'
import {cn} from '../cn'

export const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Overlay>
>(({className, ...props}, ref) => (
  <RadixDialog.Overlay forceMount ref={ref} asChild {...props}>
    <motion.div
      className={cn('fixed inset-0 z-10', className)}
      initial={{
        backdropFilter: 'blur(0px)',
        backgroundColor: 'color-mix(in oklab, var(--color-slate-700) 0%, transparent)'
      }}
      animate={{
        backdropFilter: 'blur(2px)',
        backgroundColor: 'color-mix(in oklab, var(--color-slate-700) 30%, transparent)'
      }}
      exit={{
        backdropFilter: 'blur(0px)',
        backgroundColor: 'color-mix(in oklab, var(--color-slate-700) 0%, transparent)',
        transition: {
          duration: 0.15,
          ease: 'easeOut'
        }
      }}
      transition={{
        duration: 0.25,
        ease: 'easeIn'
      }}
    />
  </RadixDialog.Overlay>
))
