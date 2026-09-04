import useAtmosphere from '~/hooks/useAtmosphere'
import DeleteCommentMutation from '~/mutations/DeleteCommentMutation'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'
import MenuItemWithIcon from './MenuItemWithIcon'

interface Props {
  commentId: string
  editComment: () => void
  meetingId: string
}

const CommentAuthorOptionsDropdown = (props: Props) => {
  const {commentId, editComment, meetingId} = props
  const atmosphere = useAtmosphere()
  const deleteComment = () => {
    DeleteCommentMutation(atmosphere, {commentId, meetingId})
  }
  return (
    <MenuContent align='end'>
      <MenuItem onClick={editComment}>
        <MenuItemWithIcon dataCy='edit-comment' label={'Edit Comment'} icon={'edit'} />
      </MenuItem>
      <MenuItem onClick={deleteComment}>
        <MenuItemWithIcon dataCy='delete-comment' label={'Delete Comment'} icon={'delete'} />
      </MenuItem>
    </MenuContent>
  )
}

export default CommentAuthorOptionsDropdown
