import useAtmosphere from 'parabol-client/src/hooks/useAtmosphere'
import DeleteCommentMutation from 'parabol-client/src/mutations/DeleteCommentMutation'
import React from 'react'
import {MenuProps} from '../hooks/useMenu'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemWithIcon from './MenuItemWithIcon'

interface Props {
  menuProps: MenuProps
  commentId: string
  editComment: () => void
}

const CommentAuthorOptionsDropdown = (props: Props) => {
  const {commentId, editComment, menuProps} = props
  const atmosphere = useAtmosphere()
  const deleteComment = () => {
    DeleteCommentMutation(atmosphere, {commentId})
  }
  return (
    <Menu ariaLabel={'Select the action for your comment'} {...menuProps}>
      <MenuItem
        label={<MenuItemWithIcon label={'Edit Comment'} icon={'edit'} />}
        onClick={editComment}
      />
      <MenuItem
        label={<MenuItemWithIcon label={'Delete Comment'} icon={'delete'} />}
        onClick={deleteComment}
      />
    </Menu>
  )
}

export default CommentAuthorOptionsDropdown
