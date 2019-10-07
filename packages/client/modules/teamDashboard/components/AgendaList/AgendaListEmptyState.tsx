import React from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../../../../styles/paletteV2'

interface Props {
  isDashboard: boolean
}

const EmptyBlock = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  padding: '0 8px'
})

const EmptyEmoji = styled('div')({
  fontSize: 18,
  minWidth: 32,
  paddingLeft: 8,
  textAlign: 'center'
})

const EmptyMessage = styled('div')({
  color: PALETTE.TEXT_GRAY,
  flex: 1,
  fontSize: 13,
  fontWeight: 400,
  lineHeight: '20px',
  paddingLeft: 16,
  paddingTop: 4
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
