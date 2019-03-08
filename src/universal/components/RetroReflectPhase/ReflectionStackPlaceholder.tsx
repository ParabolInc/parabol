import React, {RefObject} from 'react'
import styled from 'react-emotion'
import {
  cardBorderRadius,
  reflectionCardMaxHeight,
  reflectionCardWidth
} from 'universal/styles/cards'
import {typeScale} from 'universal/styles/theme/typography'
import {PALETTE} from 'universal/styles/paletteV2'

interface Props {
  idx: number
  innerRef: RefObject<HTMLDivElement>
}

const PlaceholderCard = styled('div')({
  alignItems: 'center',
  border: `1px lightgray dashed`,
  borderRadius: cardBorderRadius,
  display: 'flex',
  justifyContent: 'center',
  margin: '2rem 0',
  minHeight: reflectionCardMaxHeight,
  width: reflectionCardWidth
})

const Tip = styled('div')({
  color: PALETTE.TEXT.LIGHT,
  fontSize: typeScale[2],
  padding: '1rem',
  textAlign: 'center',
  userSelect: 'none'
})

const placeholders = [
  'Your anonymous reflections end up here',
  'Have fun with it, press : to add an emoji',
  'Your team activity is shown in the mini card grid below',
  'Collapse the sidebar if you need more room to work',
  'A highlighted column means your facilitator wants you to focus on that area',
  'Click the ? in the bottom right for more tips'
]

const seed = Math.floor(Math.random() * placeholders.length)
const ReflectionStackPlaceholder = (props: Props) => {
  const {idx, innerRef} = props
  const tip = placeholders[(seed + idx) % placeholders.length]
  return (
    <PlaceholderCard>
      <Tip innerRef={innerRef}>{tip}</Tip>
    </PlaceholderCard>
  )
}

export default ReflectionStackPlaceholder
