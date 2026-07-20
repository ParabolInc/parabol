import type * as React from 'react'
import PlainButton from './PlainButton/PlainButton'

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
  return (
    <PlainButton
      className='font-semibold leading-6 hover:text-fg-primary focus:text-fg-primary active:text-fg-primary'
      onClick={onClick}
    >
      Reply
    </PlainButton>
  )
}

export default ThreadedReplyButton
