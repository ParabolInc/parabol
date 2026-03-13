import {
  Children,
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

interface SwipeablePanelProps {
  index: number
  onChangeIndex: (index: number) => void
  children: ReactNode
  disabled?: boolean
  animateHeight?: boolean
  className?: string
  slideClassName?: string
  style?: CSSProperties
}

const SWIPE_THRESHOLD = 0.3

const SwipeablePanel = (props: SwipeablePanelProps) => {
  const {
    index,
    onChangeIndex,
    children,
    disabled,
    animateHeight,
    className,
    slideClassName,
    style
  } = props
  const containerRef = useRef<HTMLDivElement>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [height, setHeight] = useState<number | undefined>(undefined)
  const touchStartRef = useRef({x: 0, time: 0})
  // Use a ref to track dragging so handlers always see the latest value
  const draggingRef = useRef(false)
  const childCount = Children.count(children)

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return
      const touch = e.touches[0]!
      touchStartRef.current = {x: touch.clientX, time: Date.now()}
      draggingRef.current = true
      setIsDragging(true)
    },
    [disabled]
  )

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!draggingRef.current) return
    const touch = e.touches[0]!
    const deltaX = touch.clientX - touchStartRef.current.x
    setDragOffset(deltaX)
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!draggingRef.current) return
    draggingRef.current = false
    setIsDragging(false)
    const containerWidth = containerRef.current?.offsetWidth ?? 1
    const currentDragOffset = dragOffset
    const ratio = currentDragOffset / containerWidth
    const elapsed = Date.now() - touchStartRef.current.time
    const velocity = Math.abs(currentDragOffset) / elapsed

    let newIndex = index
    if (ratio < -SWIPE_THRESHOLD || (velocity > 0.5 && currentDragOffset < -10)) {
      newIndex = Math.min(index + 1, childCount - 1)
    } else if (ratio > SWIPE_THRESHOLD || (velocity > 0.5 && currentDragOffset > 10)) {
      newIndex = Math.max(index - 1, 0)
    }

    setDragOffset(0)
    if (newIndex !== index) {
      onChangeIndex(newIndex)
    }
  }, [dragOffset, index, childCount, onChangeIndex])

  // animateHeight: measure the active slide's height
  useEffect(() => {
    if (!animateHeight || !containerRef.current) return
    const slides = containerRef.current.querySelectorAll<HTMLElement>('[data-swipeable-slide]')
    const activeSlide = slides[index]
    if (!activeSlide) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.contentRect.height)
      }
    })
    observer.observe(activeSlide)
    setHeight(activeSlide.scrollHeight)
    return () => observer.disconnect()
  }, [animateHeight, index])

  const translateX = isDragging
    ? `translateX(calc(-${index * 100}% + ${dragOffset}px))`
    : `translateX(-${index * 100}%)`

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        ...style,
        overflow: 'clip',
        touchAction: disabled ? undefined : 'pan-y',
        ...(animateHeight && height != null
          ? {height, transition: isDragging ? undefined : 'height 300ms ease'}
          : {})
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        style={{
          display: 'flex',
          transform: translateX,
          transition: isDragging ? 'none' : 'transform 300ms ease',
          willChange: 'transform'
        }}
      >
        {Children.map(children, (child) => (
          <div
            data-swipeable-slide
            className={slideClassName}
            style={{width: '100%', flexShrink: 0}}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SwipeablePanel
