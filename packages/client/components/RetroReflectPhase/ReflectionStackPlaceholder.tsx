import React, {forwardRef, Ref} from 'react'
import styled from '@emotion/styled'
import {cardBorderRadius} from '../../styles/cards'
import {PALETTE} from '../../styles/paletteV2'
import {ElementHeight, ElementWidth} from '../../types/constEnums'

interface Props {
  idx: number
}

const PlaceholderCard = styled('div')({
  alignItems: 'center',
  border: `1px lightgray dashed`,
  borderRadius: cardBorderRadius,
  display: 'flex',
  justifyContent: 'center',
  minHeight: ElementHeight.REFLECTION_CARD_MAX,
  width: ElementWidth.REFLECTION_CARD
})

const Tip = styled('div')({
  color: PALETTE.TEXT_GRAY,
  fontSize: 13,
  padding: 16,
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
const ReflectionStackPlaceholder = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {idx} = props
  const tip = placeholders[(seed + idx) % placeholders.length]
  return (
    <PlaceholderCard ref={ref}>
      <Tip >{tip}</Tip>
    </PlaceholderCard>
  )
})

export default ReflectionStackPlaceholder
