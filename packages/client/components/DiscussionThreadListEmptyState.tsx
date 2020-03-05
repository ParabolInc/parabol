import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from 'styles/paletteV2'

const Message = styled('div')({
  border: `1px dashed ${PALETTE.BORDER_GRAY}`,
  color: PALETTE.TEXT_GRAY,
  fontStyle: 'italic',
  padding: 8
})

const DiscussionThreadListEmptyState = () => {
  return <Message>{'Be the first to add a comment or task'}</Message>
}

export default DiscussionThreadListEmptyState
