import * as RadixDialog from '@radix-ui/react-dialog'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import {AnimatePresence, motion} from 'motion/react'
import * as React from 'react'
import {cn} from '../cn'
import {useDialogState} from './Dialog'
import {DialogClose} from './DialogClose'
import {DialogOverlay} from './DialogOverlay'

type BaseProps = React.ComponentPropsWithoutRef<
  React.ForwardRefExoticComponent<
    RadixDialog.DialogContentProps & {noClose?: boolean} & React.RefAttributes<HTMLDivElement>
  >
>

export const DialogContent = React.forwardRef<HTMLDivElement, BaseProps>(
  ({className, children, noClose, onInteractOutside, ...props}, ref) => {
    const {isOpen} = useDialogState()
    return (
      <AnimatePresence>
        {isOpen && (
          <RadixDialog.Portal forceMount>
            <DialogOverlay className='z-10' />
            <RadixDialog.Content
              forceMount
              asChild
              aria-describedby={undefined}
              onInteractOutside={(e) => {
                // MUI pickers render popovers in a portal outside the dialog — don't close
                if ((e.target as Element | null)?.closest('[data-popper-placement]')) {
                  e.preventDefault()
                  return
                }
                onInteractOutside?.(e)
              }}
              {...props}
            >
              <motion.div
                ref={ref}
                className={cn(
                  'fixed top-[50%] left-[50%] z-20 flex max-h-[85vh] w-[95vw] max-w-[95vw] translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-lg bg-surface-card shadow-dialog focus:outline-hidden md:w-2xl md:max-w-2xl',
                  className
                )}
                initial={{opacity: 0, y: 8}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -8, transition: {duration: 0.15, ease: 'easeOut'}}}
                transition={{duration: 0.25, ease: 'easeIn'}}
              >
                <ScrollArea.Root className='flex-1 overflow-auto'>
                  <ScrollArea.Viewport className='p-6'>{children}</ScrollArea.Viewport>
                  <ScrollArea.Scrollbar orientation='vertical' />
                </ScrollArea.Root>
                {!noClose && <DialogClose />}
              </motion.div>
            </RadixDialog.Content>
          </RadixDialog.Portal>
        )}
      </AnimatePresence>
    )
  }
)
