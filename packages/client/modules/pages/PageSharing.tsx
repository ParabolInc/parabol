import graphql from 'babel-plugin-relay/macro'
import {usePreloadedQuery, type PreloadedQuery} from 'react-relay'
import type {PageSharingQuery} from '../../__generated__/PageSharingQuery.graphql'
import Avatar from '../../components/Avatar/Avatar'
import {PageAccessCombobox} from '../../components/PageAccessCombobox'
import useAtmosphere from '../../hooks/useAtmosphere'
import {Button} from '../../ui/Button/Button'

interface Props {
  pageId: string
  queryRef: PreloadedQuery<PageSharingQuery>
}

graphql`
  fragment PageSharing_access on PageAccess {
    guests {
      email
      role
    }
    users {
      user {
        id
        preferredName
        email
      }
      role
    }
    teams {
      team {
        id
        name
      }
      role
    }
    organizations {
      organization {
        id
        name
      }
      role
    }
  }
`

export const PageSharing = (props: Props) => {
  const {pageId, queryRef} = props
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const query = usePreloadedQuery<PageSharingQuery>(
    graphql`
      query PageSharingQuery($pageId: ID!) {
        viewer {
          page(pageId: $pageId) {
            isParentLinked
            parentPage {
              title
            }
            access {
              ...PageSharing_access @relay(mask: false)
            }
          }
        }
      }
    `,
    queryRef
  )

  const {viewer} = query
  const {page} = viewer

  const {access, isParentLinked, parentPage} = page
  const {users} = access
  return (
    <div className='w-full max-w-md space-y-4 bg-white p-4 text-slate-700'>
      <div className='flex items-center space-x-2'>
        <input
          placeholder='Email or group, separated by commas'
          className='flex-1 bg-slate-400 text-white'
        />
        <Button variant='secondary' className='rounded-full bg-sky-500 px-2 py-1 hover:bg-sky-600'>
          Invite
        </Button>
      </div>

      {!isParentLinked && (
        <div className='rounded-md border border-slate-700 p-2 text-sm text-slate-800'>
          Share settings on this page differ from the parent page{' '}
          <a href='#' className='text-slate-700 underline hover:text-sky-400'>
            {parentPage?.title}
          </a>
        </div>
      )}

      <div className='space-y-4'>
        {users.map(({role, user}) => {
          const {id: userId, preferredName, email} = user
          const name = userId === viewerId ? `${preferredName} (You)` : preferredName
          return (
            <div className='flex items-center justify-between' key={userId}>
              <div className='flex items-center gap-3'>
                <Avatar className='h-8 w-8' picture={'https://placehold.co/32x32'} />
                <div>
                  <p className='text-sm font-medium'>{name}</p>
                  <p className='text-zinc-400 text-xs'>{email}</p>
                </div>
              </div>
              <PageAccessCombobox
                defaultRole={role}
                subjectId={userId}
                subjectType='user'
                pageId={pageId}
              />
            </div>
          )
        })}

        {/* General Access */}
        <div>
          <p className='text-zinc-400 mb-1 text-xs'>General access</p>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <img src='https://placehold.co/32x32' alt='Parabol' className='h-8 w-8 rounded' />
              <p className='text-sm'>Everyone at Parabol</p>
            </div>
            {/* <AccessDropdown defaultValue='Full access' /> */}
          </div>
        </div>
      </div>

      {/* Copy link button */}
      <div className='border-zinc-700 flex items-center justify-between border-t pt-4'>
        <a href='#' className='text-zinc-400 text-sm hover:underline'>
          Learn about sharing
        </a>
        <Button
          variant='outline'
          className='border-zinc-700 bg-zinc-800 hover:bg-zinc-700 flex items-center gap-2 text-white'
        >
          {/* <Copy size={16} /> */}
          Copy link
        </Button>
      </div>
    </div>
  )
}
