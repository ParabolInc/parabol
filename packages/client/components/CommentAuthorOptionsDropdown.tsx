import React from 'react'
import {useTranslation} from 'react-i18next'
import useAtmosphere from '~/hooks/useAtmosphere'
import DeleteCommentMutation from '~/mutations/DeleteCommentMutation'
import {MenuProps} from '../hooks/useMenu'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemWithIcon from './MenuItemWithIcon'

interface Props {
  menuProps: MenuProps
  commentId: string
  editComment: () => void
  meetingId: string
}

const CommentAuthorOptionsDropdown = (props: Props) => {
  const {commentId, editComment, meetingId, menuProps} = props

  const {t} = useTranslation()

  const atmosphere = useAtmosphere()
  const deleteComment = () => {
    DeleteCommentMutation(atmosphere, {commentId, meetingId})
  }
  return (
    <Menu
      ariaLabel={t('CommentAuthorOptionsDropdown.SelectTheActionForYourComment')}
      {...menuProps}
    >
      <MenuItem
        label={
          <MenuItemWithIcon
            dataCy='edit-comment'
            label={t('CommentAuthorOptionsDropdown.EditComment')}
            icon={t('CommentAuthorOptionsDropdown.Edit')}
          />
        }
        onClick={editComment}
      />
      <MenuItem
        label={
          <MenuItemWithIcon
            dataCy='delete-comment'
            label={t('CommentAuthorOptionsDropdown.DeleteComment')}
            icon={t('CommentAuthorOptionsDropdown.Delete')}
          />
        }
        onClick={deleteComment}
      />
    </Menu>
  )
}

export default CommentAuthorOptionsDropdown
