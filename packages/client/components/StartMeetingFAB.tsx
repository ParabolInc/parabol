import {Add as AddIcon} from '@mui/icons-material'
import {useEffect, useRef, useState} from 'react'
import {useNavigate} from 'react-router'
import useBreakpoint from '../hooks/useBreakpoint'
import {Breakpoint} from '../types/constEnums'
import {cn} from '../ui/cn'
import FloatingActionButton from './FloatingActionButton'

interface Props {
  className?: string
}

const StartMeetingFAB = (props: Props) => {
  const {className} = props
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(true)
  const hoverTimerId = useRef<number | undefined>()
  const initTimerId = useRef<number | undefined>()

  useEffect(() => {
    if (!isDesktop) {
      initTimerId.current = window.setTimeout(() => {
        setIsExpanded(false)
      }, 10000)
    } else if (!isExpanded) {
      setIsExpanded(true)
    }
    return () => {
      window.clearTimeout(initTimerId.current)
      window.clearTimeout(hoverTimerId.current)
    }
  }, [isDesktop])

  const onMouseEnter = () => {
    if (!isDesktop) {
      hoverTimerId.current = window.setTimeout(() => {
        setIsExpanded(true)
      }, 500)
    }
  }
  const onMouseLeave = () => {
    if (!isDesktop) {
      window.clearTimeout(hoverTimerId.current)
      setIsExpanded(false)
    }
  }
  const onClick = () => {
    navigate('/activity-library')
  }
  // We use the SideBarStartMeetingButton in this case
  if (isDesktop) {
    return null
  }
  return (
    <div className={cn('fixed right-4 bottom-4 z-side-sheet', className)}>
      <FloatingActionButton
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className='z-fab h-14 overflow-hidden bg-[linear-gradient(to_right,var(--color-tomato-600)_0,var(--color-rose-500)_100%)] p-0 text-white'
      >
        <div
          className={cn(
            'm-4 h-6 w-6 transition-all duration-300 ease-[cubic-bezier(0,0,.2,1)]',
            isExpanded ? 'ml-6' : 'ml-4'
          )}
        >
          <AddIcon className='fill-white stroke-white [stroke-width:0.4]' />
        </div>
        <div
          className={cn(
            'text-start font-semibold text-[16px] transition-all duration-300 ease-[cubic-bezier(0,0,.2,1)]',
            isExpanded ? '-translate-x-1 w-32' : 'w-0 translate-x-32'
          )}
        >
          {'Add Meeting'}
        </div>
      </FloatingActionButton>
    </div>
  )
}

export default StartMeetingFAB
