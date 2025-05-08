import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {PageAccessCombobox} from '~/modules/pages/PageAccessCombobox'
import type {PageSharingAccessList_page$key} from '../../__generated__/PageSharingAccessList_page.graphql'
import Avatar from '../../components/Avatar/Avatar'
import useAtmosphere from '../../hooks/useAtmosphere'
import {Button} from '../../ui/Button/Button'

graphql`
  fragment PageSharingAccessList_pageAccess on Page {
    id
    isParentLinked
    access {
      guests {
        email
        role
      }
      users {
        user {
          id
          preferredName
          email
          picture
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
          picture
        }
        role
      }
    }
  }
`

interface Props {
  pageRef: PageSharingAccessList_page$key
}

export const PageSharingAccessList = (props: Props) => {
  const {pageRef} = props
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const page = useFragment(
    graphql`
      fragment PageSharingAccessList_page on Page {
        ...PageSharingAccessList_pageAccess @relay(mask: false)
        parentPage {
          title
        }
      }
    `,
    pageRef
  )
  const {id: pageId, isParentLinked, access, parentPage} = page
  const {users} = access
  return (
    <div className='pt-3 pb-4'>
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
          const {id: userId, preferredName, email, picture} = user
          const name = userId === viewerId ? `${preferredName} (You)` : preferredName
          return (
            <div className='flex items-center justify-between' key={userId}>
              <div className='flex items-center gap-3 pr-2'>
                <Avatar className='h-8 w-8' picture={picture} />
                <div className='flex flex-col'>
                  <div className='text-sm font-medium text-slate-700'>{name}</div>
                  <div className='text-xs text-slate-800'>{email}</div>
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
