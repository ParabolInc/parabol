import styled from '@emotion/styled'

const ThreadedItemWrapper = styled('div')<{isReply: boolean}>(({isReply}) => ({
  display: 'flex',
  flexShrink: 0, // required for safari
  marginTop: isReply ? 8 : undefined,
  width: '100%'
}))

export default ThreadedItemWrapper
