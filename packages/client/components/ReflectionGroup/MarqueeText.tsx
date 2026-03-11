import {keyframes} from '@emotion/react'
import styled from '@emotion/styled'
import {useEffect, useRef, useState} from 'react'
import {PALETTE} from '../../styles/paletteV3'
import {Card} from '../../types/constEnums'

interface Props {
  title: string
  isExpanded: boolean
  readOnly: boolean
  onActivateEdit: () => void
}

const CONTAINER_WIDTH = 172
const SCROLL_SPEED = 25 // px per second

const Container = styled('div')<{isExpanded: boolean; readOnly: boolean}>(
  ({isExpanded, readOnly}) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: CONTAINER_WIDTH,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    fontSize: Card.FONT_SIZE,
    fontWeight: 600,
    lineHeight: Card.LINE_HEIGHT,
    color: isExpanded ? '#FFFFFF' : PALETTE.SLATE_700,
    cursor: readOnly ? 'default' : 'text',
    // match NameInput's vertical padding from ui.fieldSizeStyles.small
    padding: '.3125rem 0',
    zIndex: 1,
    fontFamily:
      '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif'
  })
)

const EllipsisLayer = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  padding: 'inherit',
  // invisible — just provides the ellipsis visual
  color: 'inherit'
})

const InnerText = styled('span')<{
  isHovered: boolean
  animationName: string | null
  animationDuration: string
}>({
  display: 'inline-block',
  whiteSpace: 'nowrap'
}, ({isHovered, animationName, animationDuration}) => ({
  ...(isHovered && animationName
    ? {
        animationName,
        animationDuration,
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite'
      }
    : {
        transform: 'translateX(0)'
      })
}))

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

  const marqueeKeyframes = overflowPx > 0
    ? keyframes`
        0%   { transform: translateX(0) }
        10%  { transform: translateX(0) }
        45%  { transform: translateX(-${overflowPx}px) }
        55%  { transform: translateX(-${overflowPx}px) }
        90%  { transform: translateX(0) }
        100% { transform: translateX(0) }
      `
    : null

  const handleClick = () => {
    if (!readOnly) {
      onActivateEdit()
    }
  }

  return (
    <Container
      ref={containerRef}
      isExpanded={isExpanded}
      readOnly={readOnly}
      onMouseEnter={() => isOverflowing && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <InnerText
        ref={textRef}
        isHovered={isHovered}
        animationName={marqueeKeyframes ? marqueeKeyframes.toString() : null}
        animationDuration={animationDuration}
      >
        {title}
      </InnerText>
      {isOverflowing && !isHovered && (
        <EllipsisLayer aria-hidden>{title}</EllipsisLayer>
      )}
    </Container>
  )
}

export default MarqueeText
