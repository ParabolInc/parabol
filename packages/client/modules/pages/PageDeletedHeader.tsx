import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useHistory} from 'react-router'
import type {PageDeletedHeader_page$key} from '../../__generated__/PageDeletedHeader_page.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import {useArchivePageMutation} from '../../mutations/useArchivePageMutation'
import {Button} from '../../ui/Button/Button'
import relativeDate from '../../utils/date/relativeDate'

interface Props {
  pageRef: PageDeletedHeader_page$key
}

export const PageDeletedHeader = (props: Props) => {
  const {pageRef} = props
  const atmosphere = useAtmosphere()
  const page = useFragment(
    graphql`
      fragment PageDeletedHeader_page on Page {
        id
        deletedAt
        deletedByUser {
          id
          preferredName
        }
        access {
          viewer
        }
      }
    `,
    pageRef
  )
  const {id: pageId, deletedByUser, deletedAt, access} = page
  const {viewer: viewerAccess} = access
  const [execute] = useArchivePageMutation()
  const history = useHistory()
  const restorePage = () => {
    execute({
      variables: {
        pageId,
        action: 'restore'
      }
    })
  }
  const deletePage = () => {
    const pageCode = pageId.split('page:')[1]!
    if (location.href.endsWith(pageCode)) {
      history.push('/me')
    }
    execute({
      variables: {
        pageId,
        action: 'delete'
      }
    })
  }
  if (!deletedAt || !deletedByUser) return null
  const relativeTime = relativeDate(deletedAt, {smallDiff: 'just now'})
  const {id: userId, preferredName} = deletedByUser
  const deletingUserName = userId === atmosphere.viewerId ? 'You' : preferredName
  return (
    <div className='flex h-10 w-full items-center justify-center bg-tomato-500 font-semibold text-white'>
      <div className='pr-4'>{`${deletingUserName} moved this page to the trash ${relativeTime}`}</div>
      {viewerAccess === 'owner' && (
        <>
          <Button
            variant='outline'
            onClick={restorePage}
            className='m-1 text-white hover:bg-tomato-400'
          >
            Restore page
          </Button>
          <Button
            variant='outline'
            onClick={deletePage}
            className='m-1 text-white hover:bg-tomato-400'
          >
            Delete forever
          </Button>
        </>
      )}
    </div>
  )
}
