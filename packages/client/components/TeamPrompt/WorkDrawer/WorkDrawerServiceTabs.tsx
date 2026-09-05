import {type ReactNode, useEffect, useRef, useState} from 'react'
import {cn} from '../../../ui/cn'
import type {InspirationVariant} from './InspirationPresentationContext'

export interface WorkDrawerServiceTab {
  icon: ReactNode
  service: string
  label: string
}

interface Props {
  tabs: readonly WorkDrawerServiceTab[]
  activeIdx: number
  variant: InspirationVariant
  onSelect: (idx: number) => void
}

const FADE_LEFT =
  '[mask-image:linear-gradient(to_right,transparent_0,black_14px)] [-webkit-mask-image:linear-gradient(to_right,transparent_0,black_14px)]'
const FADE_RIGHT =
  '[mask-image:linear-gradient(to_left,transparent_0,black_14px)] [-webkit-mask-image:linear-gradient(to_left,transparent_0,black_14px)]'
const FADE_BOTH =
  '[mask-image:linear-gradient(to_right,transparent_0,black_14px,black_calc(100%-14px),transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0,black_14px,black_calc(100%-14px),transparent_100%)]'

const WorkDrawerServiceTabs = (props: Props) => {
  const {tabs, activeIdx, variant, onSelect} = props
  const isSheet = variant === 'sheet'
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)
  const [isScrollable, setIsScrollable] = useState(false)
  const [fadeLeft, setFadeLeft] = useState(false)
  const [fadeRight, setFadeRight] = useState(false)

  const measureFade = (scroller: HTMLDivElement) => {
    setFadeLeft(scroller.scrollLeft > 0)
    setFadeRight(scroller.scrollLeft < scroller.scrollWidth - scroller.clientWidth - 1)
  }

  useEffect(() => {
    if (!isSheet) return
    const scroller = scrollRef.current
    if (!scroller) return
    setIsScrollable(scroller.scrollWidth > scroller.clientWidth + 1)
    measureFade(scroller)
  }, [isSheet, tabs.length])

  useEffect(() => {
    if (!isSheet) return
    const scroller = scrollRef.current
    const active = activeRef.current
    if (!scroller || !active) return
    scroller.scrollLeft = active.offsetLeft - (scroller.clientWidth - active.offsetWidth) / 2
  }, [isSheet, activeIdx])

  useEffect(() => {
    if (!isSheet) return
    const scroller = scrollRef.current
    if (!scroller) return
    const observer = new ResizeObserver(() => {
      setIsScrollable(scroller.scrollWidth > scroller.clientWidth + 1)
      measureFade(scroller)
    })
    observer.observe(scroller)
    return () => observer.disconnect()
  }, [isSheet])

  const strip = (
    <div className='flex gap-1'>
      {tabs.map((tab, idx) => {
        const isActive = idx === activeIdx
        return (
          <button
            key={tab.label}
            ref={isActive ? activeRef : undefined}
            type='button'
            title={tab.label}
            aria-label={tab.label}
            aria-pressed={isActive}
            onClick={() => onSelect(idx)}
            className={cn(
              'flex shrink-0 appearance-none items-center justify-center',
              isSheet ? 'h-11 w-11' : 'h-10 w-10',
              !isActive && 'cursor-pointer'
            )}
          >
            <span
              className={cn(
                'flex items-center justify-center rounded-md transition-colors',
                isSheet ? 'h-9 w-9' : 'h-10 w-10',
                isActive
                  ? 'bg-surface-selected text-fg-selected [&_path]:fill-current'
                  : 'text-fg-muted hover:bg-surface-hover'
              )}
            >
              {tab.icon}
            </span>
          </button>
        )
      })}
    </div>
  )
  if (!isSheet) return strip
  return (
    <div
      ref={scrollRef}
      onScroll={(e) => measureFade(e.currentTarget)}
      className={cn(
        'ml-auto min-w-0 max-w-[45%] overflow-x-auto',
        isScrollable && fadeLeft && fadeRight && FADE_BOTH,
        isScrollable && fadeLeft && !fadeRight && FADE_LEFT,
        isScrollable && !fadeLeft && fadeRight && FADE_RIGHT
      )}
    >
      {strip}
    </div>
  )
}

export default WorkDrawerServiceTabs
