import {
  Children,
  cloneElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import {cn} from '../../ui/cn'
import getBBox from '../RetroReflectPhase/getBBox'

interface Props {
  activeIdx: number
  children: ReactNode
  className?: string
}

const Tabs = (props: Props) => {
  const {activeIdx, children, className} = props
  const [transform, setTransform] = useState('scaleX(0)')
  const activeChildRef = useRef<HTMLElement | null>(null)
  const parentRef = useRef<HTMLElement | null>(null)

  const moveInkBar = (parent: HTMLElement | null, child: HTMLElement | null) => {
    const childBBox = child && getBBox(child)
    const parentBBox = parent && getBBox(parent)
    if (!childBBox || !parentBBox) return
    const left = childBBox.left - parentBBox.left
    setTransform(`translate3d(${left}px, 0, 0)scaleX(${childBBox.width / 1000})`)
  }

  const setChildRef = useCallback((c: HTMLElement | null) => {
    if (c && c !== activeChildRef.current) {
      moveInkBar(parentRef.current, c)
    }
    activeChildRef.current = c
  }, [])

  const setParentRef = useCallback((c: HTMLElement | null) => {
    if (c && c !== parentRef.current) {
      moveInkBar(c, activeChildRef.current)
    }
    parentRef.current = c
  }, [])

  useEffect(() => {
    const parent = parentRef.current
    if (!parent) return
    const observer = new ResizeObserver(() => {
      moveInkBar(parentRef.current, activeChildRef.current)
    })
    observer.observe(parent)
    return () => observer.disconnect()
  }, [])

  const properChildren = Children.map(children, (child, idx) => {
    const isActive = idx === activeIdx
    return cloneElement(child as ReactElement<any>, {
      isActive,
      ref: isActive ? setChildRef : null
    })
  })

  return (
    <div className={cn('relative flex w-full flex-col', className)} ref={setParentRef}>
      <div className='flex w-full'>{properChildren}</div>
      <div
        className='absolute bottom-0 left-0 h-0.5 w-[1000px] origin-left bg-accent-active transition-all duration-300 ease-[ease]'
        style={{transform}}
      />
    </div>
  )
}

export default Tabs
