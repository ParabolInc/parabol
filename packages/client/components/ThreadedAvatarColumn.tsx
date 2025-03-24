import styled from '@emotion/styled'
import Avatar from './Avatar/Avatar'

const AvatarCol = styled('div')<{isReply: boolean | undefined}>(({isReply}) => ({
  display: 'flex',
  paddingRight: 8,
  paddingLeft: isReply ? undefined : 12
}))

interface Props {
  isReply: boolean | undefined
  picture: string | null
}

const ThreadedAvatarColumn = (props: Props) => {
  const {picture, isReply} = props
  return (
    <AvatarCol isReply={isReply}>
      <Avatar picture={picture} className='h-8 w-8' />
    </AvatarCol>
  )
}

export default ThreadedAvatarColumn
