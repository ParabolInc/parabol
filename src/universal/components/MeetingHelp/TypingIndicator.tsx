import React from 'react'
import styled, {keyframes} from 'react-emotion'
import ui from 'universal/styles/ui'

const BulgeKeyframes = keyframes`
  50% {
    transform: scale(1.05);
  }
`

const BlinkKeyframes = keyframes`
  50% {
    opacity: 1;
  }
`

const THOUGHT_BUBBLE_STYLES = {
  content: '',
  // silly typescript https://github.com/Microsoft/TypeScript/issues/11465
  position: 'absolute' as 'absolute',
  bottom: '-2px',
  left: '-2px',
  height: '12px',
  width: '12px',
  'border-radius': '50%',
  'background-color': ui.palette.gray
}

const MinorThoughtBubble = styled('div')(() => ({
  ...THOUGHT_BUBBLE_STYLES,
  height: '6px',
  width: '6px',
  left: '-4px',
  bottom: '-4px'
}))

const MajorThoughtBubble = styled('div')(() => ({
  ...THOUGHT_BUBBLE_STYLES
}))

const TypingIndicatorBubble = styled('div')(() => ({
  'background-color': ui.palette.gray,
  'will-change': 'transform',
  width: 'auto',
  'border-radius': '24px',
  padding: '12px',
  display: 'table',
  margin: '12px',
  position: 'relative',
  top: '-8px',
  animation: `2s ${BulgeKeyframes} infinite ease-out`
}))

const BlinkyThoughtDot = styled('span')(({n}: {n: number}) => ({
  height: '8px',
  width: '8px',
  float: 'left',
  margin: '0 1px',
  'background-color': ui.palette.midGray,
  display: 'block',
  'border-radius': '50%',
  opacity: 0.4,
  animation: `1s ${BlinkKeyframes} infinite ${n * 0.3333}s`
}))

const TypingIndicator = React.memo(() => {
  return (
    <TypingIndicatorBubble>
      <MinorThoughtBubble />
      <MajorThoughtBubble />
      <BlinkyThoughtDot n={1} />
      <BlinkyThoughtDot n={2} />
      <BlinkyThoughtDot n={3} />
    </TypingIndicatorBubble>
  )
})

export default TypingIndicator
