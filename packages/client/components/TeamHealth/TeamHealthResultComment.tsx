import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthResultComment_response$key} from '~/__generated__/TeamHealthResultComment_response.graphql'
import Avatar from '../Avatar/Avatar'

interface Props {
  response: TeamHealthResultComment_response$key
}

// a signed comment carries its author underneath; an anonymous one reads as a bare reflection
const TeamHealthResultComment = (props: Props) => {
  const {response: responseRef} = props
  const response = useFragment(
    graphql`
      fragment TeamHealthResultComment_response on TeamHealthResponse {
        commentParaphrased
        commentAuthor {
          preferredName
          picture
        }
      }
    `,
    responseRef
  )
  const {commentParaphrased, commentAuthor} = response
  if (!commentParaphrased) return null
  return (
    <div className='flex flex-col gap-3 rounded-lg bg-surface-well p-4 text-fg-primary'>
      <div>“{commentParaphrased}”</div>
      {commentAuthor && (
        <div className='mt-auto flex items-center gap-2'>
          <Avatar picture={commentAuthor.picture} className='size-6' />
          <span className='font-semibold text-fg-secondary text-sm'>
            {commentAuthor.preferredName}
          </span>
        </div>
      )}
    </div>
  )
}

export default TeamHealthResultComment
