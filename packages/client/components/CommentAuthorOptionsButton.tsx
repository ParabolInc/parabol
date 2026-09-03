import {Suspense} from 'react'
import {MoreVert} from '~/ui/icons'
import {Menu} from '~/ui/Menu/Menu'
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
  return (
    <Menu
      trigger={
        <PlainButton
          className='hover:text-fg-primary focus:text-fg-primary active:text-fg-primary'
          onMouseEnter={CommentAuthorOptionsDropdown.preload}
        >
          <div className='ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-3xl text-inherit leading-6'>
            <MoreVert className='h-[18px] w-[18px]' />
          </div>
        </PlainButton>
      }
    >
      <Suspense fallback={null}>
        <CommentAuthorOptionsDropdown
          commentId={commentId}
          editComment={editComment}
          meetingId={meetingId}
        />
      </Suspense>
    </Menu>
  )
}

export default CommentAuthorOptionsButton
