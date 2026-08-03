import * as Popover from '@radix-ui/react-popover'
import {AnimatePresence, motion} from 'motion/react'
import type {ReactNode} from 'react'
import {cn} from '../../../../ui/cn'

interface Props {
  open: boolean
  className?: string
  children: ReactNode
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>
}

const AvatarPopoverContent = ({open, className, children, onMouseEnter, onMouseLeave}: Props) => (
  <AnimatePresence>
    {open && (
      <Popover.Portal forceMount>
        <Popover.Content forceMount side='top' sideOffset={8} align='center' asChild>
          <motion.div
            className={cn(
              'z-50 rounded-lg bg-surface-card py-1 shadow-card-1 outline-none',
              className
            )}
            initial={{opacity: 0, scale: 0.95, y: -8}}
            animate={{opacity: 1, scale: 1, y: 0}}
            exit={{opacity: 0, scale: 0.95, y: -8, transition: {duration: 0.15, ease: 'easeOut'}}}
            transition={{duration: 0.15, ease: [0, 0, 0.2, 1]}}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            {children}
          </motion.div>
        </Popover.Content>
      </Popover.Portal>
    )}
  </AnimatePresence>
)

export default AvatarPopoverContent
