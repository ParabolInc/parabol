import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from 'styles/paletteV2'
import {Elevation} from 'styles/elevation'

const Wrapper = styled('div')({
  alignItems: 'center',
  boxShadow: Elevation.DISCUSSION_THREAD_INSET,
  display: 'flex',
  height: '100%',
  justifyContent: 'center'
})

const Message = styled('div')({
  border: `1px dashed ${PALETTE.BORDER_GRAY}`,
  color: PALETTE.TEXT_GRAY,
  fontStyle: 'italic',
  padding: 8
})

const DiscussionThreadListEmptyState = () => {
  return (
    <Wrapper>
      <Message>{'Be the first to add a comment or task'}</Message>
    </Wrapper>
  )
}

export default DiscussionThreadListEmptyState
