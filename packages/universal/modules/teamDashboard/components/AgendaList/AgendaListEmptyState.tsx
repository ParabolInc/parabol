import React from 'react'
import styled from '@emotion/styled'
import {PALETTE} from 'universal/styles/paletteV2'

interface Props {
  isDashboard: boolean
}

const EmptyBlock = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  padding: 8,
  paddingTop: 0
})

const EmptyEmoji = styled('div')({
  fontSize: 18,
  minWidth: '2rem',
  paddingLeft: '1.375rem'
})

const EmptyMessage = styled('div')({
  color: PALETTE.TEXT_MAIN,
  flex: 1,
  fontSize: 13,
  lineHeight: '1.5',
  paddingLeft: '.5rem',
  paddingTop: '.25rem'
})

const AgendaListEmptyState = (props: Props) => {
  const {isDashboard} = props
  const meetingContext = isDashboard ? 'next meeting' : 'meeting'
  return (
    <EmptyBlock>
      <EmptyEmoji>🤓</EmptyEmoji>
      <EmptyMessage>
        {`Pssst. Add topics for your ${meetingContext}! Use a phrase like “`}
        <b>
          <i>{'upcoming vacation'}</i>
        </b>
        {'.”'}
      </EmptyMessage>
    </EmptyBlock>
  )
}

export default AgendaListEmptyState
