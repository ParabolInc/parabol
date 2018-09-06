import React from 'react'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import {reflectionCardMaxHeight} from 'universal/styles/cards'
import appTheme from 'universal/styles/theme/appTheme'

interface Props {
  idx: number
}

const PlaceholderCard = styled('div')({
  alignItems: 'center',
  border: `1px lightgray dashed`,
  borderRadius: 4,
  display: 'flex',
  justifyContent: 'center',
  margin: '2rem 0',
  minHeight: reflectionCardMaxHeight,
  width: ui.retroCardWidth
})

const Tip = styled('div')({
  color: ui.hintColor,
  fontSize: appTheme.typography.s2,
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
  const {idx} = props
  const tip = placeholders[(seed + idx) % placeholders.length]
  return (
    <PlaceholderCard>
      <Tip>{tip}</Tip>
    </PlaceholderCard>
  )
}

export default ReflectionStackPlaceholder
