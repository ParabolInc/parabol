import {useEffect, useRef, useState} from 'react'
import {cn} from '../../ui/cn'

interface Props {
  title: string
  isExpanded: boolean
  readOnly: boolean
  onActivateEdit: () => void
}

const CONTAINER_WIDTH = 172
const SCROLL_SPEED = 25 // px per second

const MarqueeText = (props: Props) => {
  const {title, isExpanded, readOnly, onActivateEdit} = props
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [overflowPx, setOverflowPx] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    const text = textRef.current
    if (!container || !text) return
    const overflow = text.scrollWidth - container.clientWidth
    setIsOverflowing(overflow > 0)
    setOverflowPx(overflow > 0 ? overflow : 0)
  }, [title])

  const animationDuration = overflowPx > 0 ? `${overflowPx / SCROLL_SPEED}s` : '0s'

  const handleClick = () => {
    if (!readOnly) {
      onActivateEdit()
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'absolute top-0 left-0 z-1 overflow-hidden whitespace-nowrap font-sans font-semibold text-sm leading-5',
        'py-[.3125rem]',
        isExpanded ? 'text-white' : 'text-slate-700',
        readOnly ? 'cursor-default' : 'cursor-text'
      )}
      style={{width: CONTAINER_WIDTH}}
      onMouseEnter={() => isOverflowing && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <span
        ref={textRef}
        className='inline-block whitespace-nowrap'
        style={
          isHovered && overflowPx > 0
            ? ({
                '--marquee-offset': `-${overflowPx}px`,
                '--marquee-duration': animationDuration,
                animation: 'var(--animate-marquee-scroll)'
              } as React.CSSProperties)
            : {transform: 'translateX(0)'}
        }
      >
        {title}
      </span>
      {isOverflowing && !isHovered && (
        <div
          className='pointer-events-none absolute inset-0 overflow-hidden text-ellipsis whitespace-nowrap p-inherit text-inherit'
          style={{padding: 'inherit'}}
          aria-hidden
        >
          {title}
        </div>
      )}
    </div>
  )
}

export default MarqueeText
