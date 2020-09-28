import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '~/styles/paletteV2'

const Message = styled('div')({
  border: `1px dashed ${PALETTE.BORDER_GRAY}`,
  borderRadius: 4,
  color: PALETTE.TEXT_GRAY,
  fontSize: 14,
  fontStyle: 'italic',
  lineHeight: '20px',
  margin: 'auto',
  padding: 8
})

interface Props {
  isEndedMeeting: boolean
}

const DiscussionThreadListEmptyState = (props: Props) => {
  const {isEndedMeeting} = props
  if (isEndedMeeting) return <Message>{'No comments or tasks were added here'}</Message>
  return <Message>{'✍️ Be the first to add a comment or task'}</Message>
}

export default DiscussionThreadListEmptyState
