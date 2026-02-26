import type * as React from 'react'
import {type ReactNode, useEffect, useRef, useState} from 'react'
import useScrollIntoView from '../hooks/useScrollIntoVIew'
import {cn} from '../ui/cn'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'

interface Props {
  isActive: boolean
  isComplete?: boolean
  isDisabled: boolean
  isDragging: boolean
  isUnsyncedFacilitatorStage: boolean
  children: ReactNode
  metaContent: any
  onClick: ((e: React.MouseEvent) => void) | undefined
}

const MeetingSubnavItem = (props: Props) => {
  const {
    isActive,
    isComplete,
    isDisabled,
    isDragging,
    isUnsyncedFacilitatorStage,
    children,
    metaContent,
    onClick
  } = props
  const ref = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  useScrollIntoView(ref, isActive)

  useEffect(() => {
    const el = labelRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      setIsOverflowing(el.scrollWidth > el.clientWidth)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex min-h-10 w-full shrink-0 select-none items-center rounded-r py-2 font-normal text-slate-700 text-sm',
        isActive ? 'bg-slate-200' : isDragging ? 'bg-slate-100' : 'bg-transparent',
        !isActive && isComplete && 'opacity-50',
        onClick && !isActive && 'hover:bg-slate-200',
        !isActive && onClick && 'hover:cursor-pointer',
        !isDisabled && 'hover:opacity-100',
        isUnsyncedFacilitatorStage && 'text-rose-500 opacity-100'
      )}
      onClick={!isDisabled ? onClick : undefined}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={labelRef}
            className={cn(
              'wrap-break-word flex-1 overflow-hidden text-ellipsis whitespace-pre pl-14 text-inherit',
              isComplete && 'line-through'
            )}
          >
            {children}
          </div>
        </TooltipTrigger>
        {isOverflowing && <TooltipContent>{children}</TooltipContent>}
      </Tooltip>
      <div className='flex h-[22px] content-center items-center pl-1'>{metaContent}</div>
    </div>
  )
}

export default MeetingSubnavItem
