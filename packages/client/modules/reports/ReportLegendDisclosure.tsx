import {AnimatePresence, motion} from 'motion/react'
import {type ReactNode, useId} from 'react'
import {ExpandMore} from '~/ui/icons'
import useLocalStorageState from '../../hooks/useLocalStorageState'
import {cn} from '../../ui/cn'

interface Props {
  children: ReactNode
  isEndAligned?: boolean
}

// A report's legend opens and closes the way a reactji comes and goes, and stays as the viewer last left it
const ReportLegendDisclosure = ({children, isEndAligned = false}: Props) => {
  const [isHidden, setIsHidden] = useLocalStorageState('Reports:isLegendHidden', false)
  const legendId = useId()
  return (
    <div className={cn('flex min-w-0 flex-col', isEndAligned ? 'items-end' : 'items-start')}>
      <button
        type='button'
        aria-expanded={!isHidden}
        aria-controls={legendId}
        onClick={() => setIsHidden((wasHidden) => !wasHidden)}
        className='inline-flex items-center gap-0.5 rounded-sm font-semibold text-fg-secondary text-xs hover:text-fg-primary'
      >
        <ExpandMore
          className={cn('text-[16px] transition-transform duration-250', isHidden && '-rotate-90')}
        />
        {isHidden ? 'Show legend' : 'Hide legend'}
      </button>
      <AnimatePresence initial={false}>
        {!isHidden && (
          <motion.div
            id={legendId}
            initial={{height: 0, opacity: 0}}
            animate={{height: 'auto', opacity: 1}}
            exit={{height: 0, opacity: 0}}
            transition={{duration: 0.25, ease: 'easeIn'}}
            className='self-stretch overflow-hidden'
          >
            <div className='pt-2'>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ReportLegendDisclosure
