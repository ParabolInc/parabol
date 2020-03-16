import styled from '@emotion/styled'
import React from 'react'
import PlainButton from './PlainButton/PlainButton'

const Reply = styled(PlainButton)({
  fontWeight: 600,
  lineHeight: '24px'
})

interface Props {
  onReply: () => void
}

const ThreadedReplyButton = (props: Props) => {
  const {onReply} = props
  return <Reply onClick={onReply}>Reply</Reply>
}

export default ThreadedReplyButton
