import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from 'styles/paletteV2'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'

export type CommentSubmitState = 'send' | 'add' | 'addExpanded'

const SendIcon = styled(Icon)({
  color: PALETTE.TEXT_BLUE,
  fontSize: 32,
  padding: 12
})

const AddIcon = styled(Icon)({
  color: '#fff',
  backgroundColor: PALETTE.BACKGROUND_BLUE,
  borderRadius: '100%',
  fontSize: 24,
  margin: 12,
  padding: 4
})

const AddButton = styled(PlainButton)({
  borderLeft: `1px solid ${PALETTE.BORDER_GRAY}`
})

interface Props {
  commentSubmitState: CommentSubmitState
}

const CommentSendOrAdd = (props: Props) => {
  const {commentSubmitState} = props
  if (commentSubmitState === 'send') {
    return (
      <PlainButton>
        <SendIcon>send</SendIcon>
      </PlainButton>
    )
  }
  if (commentSubmitState === 'add') {
    return (
      <AddButton>
        <AddIcon>playlist_add_check</AddIcon>
      </AddButton>
    )
  }
  return <div>hi</div>
}

export default CommentSendOrAdd
