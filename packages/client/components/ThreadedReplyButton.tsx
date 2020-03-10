import styled from '@emotion/styled'
import React from 'react'
import PlainButton from './PlainButton/PlainButton'

const Reply = styled(PlainButton)({
  fontWeight: 600,
  lineHeight: '24px'
})

interface Props {
  isReplying: boolean
  onReply: () => void
}

const ThreadedReplyButton = (props: Props) => {
  const {isReplying, onReply} = props
  return isReplying ? null : <Reply onClick={onReply}>Reply</Reply>
}

export default ThreadedReplyButton
