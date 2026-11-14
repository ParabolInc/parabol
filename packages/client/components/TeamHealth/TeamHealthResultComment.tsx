import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthResultComment_response$key} from '~/__generated__/TeamHealthResultComment_response.graphql'
import Avatar from '../Avatar/Avatar'

interface Props {
  response: TeamHealthResultComment_response$key
}

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
    <div className='flex flex-col rounded-lg bg-surface-well p-2 text-fg-primary'>
      <div className='p-2'>“{commentParaphrased}”</div>
      {commentAuthor && (
        <div className='mt-auto flex items-center justify-end gap-1.5'>
          <Avatar picture={commentAuthor.picture} className='size-5' />
          <span className='font-semibold text-[13px] text-fg-secondary'>
            {commentAuthor.preferredName}
          </span>
        </div>
      )}
    </div>
  )
}

export default TeamHealthResultComment
