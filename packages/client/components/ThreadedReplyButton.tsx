import styled from '@emotion/styled'
import * as React from 'react'
import {PALETTE} from '~/styles/paletteV3'
import PlainButton from './PlainButton/PlainButton'

const Reply = styled(PlainButton)({
  fontWeight: 600,
  lineHeight: '24px',
  ':hover, :focus, :active': {
    color: PALETTE.SLATE_700
  }
})

interface Props {
  onReply: () => void
}

const ThreadedReplyButton = (props: Props) => {
  const {onReply} = props

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // stop propagating so the new reply is not immediately cancelled
    e.stopPropagation()
    onReply()
  }
  return <Reply onClick={onClick}>Reply</Reply>
}

export default ThreadedReplyButton
