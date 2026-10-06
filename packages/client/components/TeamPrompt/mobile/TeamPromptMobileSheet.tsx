import * as RadixDialog from '@radix-ui/react-dialog'
import {AnimatePresence, motion} from 'motion/react'
import type {ReactNode} from 'react'
import {Close} from '~/ui/icons'
import {cn} from '../../../ui/cn'
import {Dialog} from '../../../ui/Dialog/Dialog'
import {DialogOverlay} from '../../../ui/Dialog/DialogOverlay'
import {NestedModalContext} from '../../../ui/Modal/NestedModalContext'

interface Props {
  isOpen: boolean
  onClose: () => void
  title: string
  isFullHeight?: boolean
  children: ReactNode
}

const TeamPromptMobileSheet = (props: Props) => {
  const {isOpen, onClose, title, isFullHeight, children} = props
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <AnimatePresence>
        {isOpen && (
          <RadixDialog.Portal forceMount>
            <DialogOverlay className='z-10' />
            <RadixDialog.Content
              forceMount
              asChild
              aria-describedby={undefined}
              onOpenAutoFocus={(e) => e.preventDefault()}
              onInteractOutside={(e) => {
                if ((e.target as Element | null)?.closest('[data-suggestion-popup]')) {
                  e.preventDefault()
                }
              }}
            >
              <motion.div
                className={cn(
                  'fixed inset-x-0 bottom-0 z-20 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-2xl border-hairline border-t bg-surface-drawer pb-[env(safe-area-inset-bottom)] focus:outline-hidden',
                  isFullHeight && 'h-[92dvh]'
                )}
                initial={{y: '100%'}}
                animate={{y: 0}}
                exit={{y: '100%', transition: {duration: 0.15, ease: 'easeIn'}}}
                transition={{duration: 0.25, ease: 'easeOut'}}
              >
                <div className='flex shrink-0 items-center border-hairline border-b py-1 pr-1 pl-4'>
                  <RadixDialog.Title className='m-0 min-w-0 flex-1 truncate font-semibold text-base'>
                    {title}
                  </RadixDialog.Title>
                  <RadixDialog.Close
                    aria-label='Close'
                    className='flex h-11 w-11 cursor-pointer items-center justify-center rounded-md bg-transparent text-fg-secondary hover:bg-surface-hover'
                  >
                    <Close />
                  </RadixDialog.Close>
                </div>
                <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
                  <NestedModalContext.Provider value={true}>{children}</NestedModalContext.Provider>
                </div>
              </motion.div>
            </RadixDialog.Content>
          </RadixDialog.Portal>
        )}
      </AnimatePresence>
    </Dialog>
  )
}

export default TeamPromptMobileSheet
