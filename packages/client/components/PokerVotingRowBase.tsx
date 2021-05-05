import styled from '@emotion/styled'

const PokerVotingRowBase = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexShrink: 0,
  minHeight: 56, // maintain tallest height, account for avatar group plus padding
  padding: '5px 0 5px 16px' // 5px instead of 8px, account for overlapping 3px border of avatars
})

export default PokerVotingRowBase
