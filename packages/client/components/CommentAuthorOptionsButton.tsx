import {MoreVert} from '@mui/icons-material'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import lazyPreload from '~/utils/lazyPreload'
import PlainButton from './PlainButton/PlainButton'

const CommentAuthorOptionsDropdown = lazyPreload(
  () =>
    import(/* webpackChunkName: 'CommentAuthorOptionsDropdown' */ './CommentAuthorOptionsDropdown')
)

interface Props {
  commentId: string
  editComment: () => void
  meetingId: string
}

const CommentAuthorOptionsButton = (props: Props) => {
  const {commentId, editComment, meetingId} = props
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  return (
    <PlainButton
      className='hover:text-fg-primary focus:text-fg-primary active:text-fg-primary'
      onMouseEnter={CommentAuthorOptionsDropdown.preload}
      ref={originRef}
      onClick={togglePortal}
    >
      <div className='ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-3xl text-inherit leading-6'>
        <MoreVert className='h-[18px] w-[18px]' />
      </div>
      {menuPortal(
        <CommentAuthorOptionsDropdown
          menuProps={menuProps}
          commentId={commentId}
          editComment={editComment}
          meetingId={meetingId}
        />
      )}
    </PlainButton>
  )
}

export default CommentAuthorOptionsButton
