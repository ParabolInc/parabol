import styled from '@emotion/styled'
import {
  Children,
  cloneElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useRef,
  useState
} from 'react'
import {PALETTE} from '../../styles/paletteV3'
import getBBox from '../RetroReflectPhase/getBBox'

interface Props {
  activeIdx: number
  children: ReactNode
  className?: string
}

const INKBAR_HEIGHT = 2

const InkBar = styled('div')({
  background: PALETTE.GRAPE_700,
  bottom: 0,
  height: INKBAR_HEIGHT,
  left: 0,
  position: 'absolute',
  transformOrigin: 'left',
  transition: 'all 300ms',
  width: 1000
})

const TabsAndBar = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  width: '100%'
})

const TabHeaders = styled('div')({
  display: 'flex',
  width: '100%'
})

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

  const properChildren = Children.map(children, (child, idx) => {
    const isActive = idx === activeIdx
    return cloneElement(child as ReactElement<any>, {
      isActive,
      ref: isActive ? setChildRef : null
    })
  })

  return (
    <TabsAndBar className={className} ref={setParentRef}>
      <TabHeaders>{properChildren}</TabHeaders>
      <InkBar style={{transform}} />
    </TabsAndBar>
  )
}

export default Tabs
