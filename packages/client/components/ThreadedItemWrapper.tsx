import styled from '@emotion/styled'

const ThreadedItemWrapper = styled('div')<{isReply: boolean}>(({isReply}) => ({
  display: 'flex',
  marginTop: isReply ? 8 : undefined,
  width: '100%'
}))

export default ThreadedItemWrapper
