import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '~/styles/paletteV3'

const Message = styled('div')({
  border: `1px dashed ${PALETTE.SLATE_400}`,
  borderRadius: 4,
  color: PALETTE.SLATE_600,
  fontSize: 14,
  fontStyle: 'italic',
  lineHeight: '20px',
  margin: 'auto',
  padding: 8
})

interface Props {
  isReadOnly?: boolean
  allowTasks: boolean
}

const DiscussionThreadListEmptyState = (props: Props) => {
  const {isReadOnly, allowTasks} = props
  const readOnlyMessage = allowTasks
    ? 'No comments or tasks were added here'
    : 'No comments were added here'
  const message = allowTasks
    ? '✍️ Be the first to add a comment or task'
    : '✍️ Be the first to add a comment'
  return <Message>{isReadOnly ? readOnlyMessage : message}</Message>
}

export default DiscussionThreadListEmptyState
