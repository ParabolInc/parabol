import * as RadixDialog from '@radix-ui/react-dialog'
import {AnimatePresence, motion, useDragControls, useReducedMotion} from 'motion/react'
import {type PointerEvent, type ReactNode, useRef} from 'react'
import {cn} from '../cn'
import {resolveSheetDismiss} from './resolveSheetDismiss'

interface Props {
  isOpen: boolean
  onClose: () => void
  ariaLabel: string
  children: ReactNode
  className?: string
}

export const BottomSheet = ({isOpen, onClose, ariaLabel, children, className}: Props) => {
  const dragControls = useDragControls()
  const shouldReduceMotion = useReducedMotion()

  const previouslyFocusedRef = useRef<HTMLElement | null>(null)
  const wasOpenRef = useRef(isOpen)
  if (isOpen && !wasOpenRef.current) {
    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
  }
  wasOpenRef.current = isOpen

  const startHandleDrag = (e: PointerEvent<HTMLDivElement>) => dragControls.start(e)

  return (
    <RadixDialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence onExitComplete={() => previouslyFocusedRef.current?.focus()}>
        {isOpen && (
          <RadixDialog.Portal forceMount>
            <RadixDialog.Overlay asChild forceMount>
              <motion.div
                className='fixed inset-0 z-10 bg-[rgba(28,28,33,.4)]'
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={shouldReduceMotion ? {duration: 0} : undefined}
              />
            </RadixDialog.Overlay>
            <RadixDialog.Content
              asChild
              forceMount
              aria-label={ariaLabel}
              aria-describedby={undefined}
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <motion.div
                className={cn(
                  'fixed inset-x-0 bottom-0 z-20 flex h-[680px] max-h-[85vh] flex-col overflow-hidden rounded-t-[20px] bg-surface-raised pb-[env(safe-area-inset-bottom)] shadow-[var(--shadow-card)] focus:outline-hidden',
                  className
                )}
                initial={shouldReduceMotion ? {opacity: 0} : {y: '100%'}}
                animate={shouldReduceMotion ? {opacity: 1} : {y: 0}}
                exit={
                  shouldReduceMotion
                    ? {opacity: 0, transition: {duration: 0.1}}
                    : {y: '100%', transition: {duration: 0.18, ease: 'easeIn'}}
                }
                transition={
                  shouldReduceMotion ? {duration: 0.1} : {duration: 0.24, ease: 'easeOut'}
                }
                drag='y'
                dragListener={false}
                dragControls={dragControls}
                dragConstraints={{top: 0, bottom: 0}}
                dragElastic={{top: 0, bottom: 0.4}}
                onDragEnd={(_e, info) => {
                  if (resolveSheetDismiss(info.offset.y, info.velocity.y)) onClose()
                }}
              >
                <div
                  className='flex h-4 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing'
                  onPointerDown={startHandleDrag}
                  aria-hidden
                >
                  <div className='h-[5px] w-9 rounded-full bg-hairline-strong' />
                </div>
                {children}
              </motion.div>
            </RadixDialog.Content>
          </RadixDialog.Portal>
        )}
      </AnimatePresence>
    </RadixDialog.Root>
  )
}
