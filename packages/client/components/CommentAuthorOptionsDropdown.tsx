import {useRef} from 'react'
import useAtmosphere from '~/hooks/useAtmosphere'
import DeleteCommentMutation from '~/mutations/DeleteCommentMutation'
import Delete from '../ui/icons/Delete'
import Edit from '../ui/icons/Edit'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MENU_ITEM_ICON, MenuItem} from '../ui/Menu/MenuItem'

interface Props {
  commentId: string
  editComment: () => void
  meetingId: string
}

const CommentAuthorOptionsDropdown = (props: Props) => {
  const {commentId, editComment, meetingId} = props
  const atmosphere = useAtmosphere()
  const isEditingRef = useRef(false)
  const startEditing = () => {
    isEditingRef.current = true
    editComment()
  }
  const deleteComment = () => {
    DeleteCommentMutation(atmosphere, {commentId, meetingId})
  }
  return (
    <MenuContent
      align='end'
      onCloseAutoFocus={(e) => {
        if (isEditingRef.current) e.preventDefault()
      }}
    >
      <MenuItem onClick={startEditing}>
        <Edit className={MENU_ITEM_ICON} />
        Edit Comment
      </MenuItem>
      <MenuItem onClick={deleteComment}>
        <Delete className={MENU_ITEM_ICON} />
        Delete Comment
      </MenuItem>
    </MenuContent>
  )
}

export default CommentAuthorOptionsDropdown
