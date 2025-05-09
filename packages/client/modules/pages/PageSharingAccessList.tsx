import PublicIcon from '@mui/icons-material/Public'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {PageAccessCombobox} from '~/modules/pages/PageAccessCombobox'
import type {PageSharingAccessList_page$key} from '../../__generated__/PageSharingAccessList_page.graphql'
import Avatar from '../../components/Avatar/Avatar'
import TeamAvatar from '../../components/TeamAvatar/TeamAvatar'
import useAtmosphere from '../../hooks/useAtmosphere'

graphql`
  fragment PageSharingAccessList_pageAccess on Page {
    id
    isParentLinked
    access {
      public
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
  const {users, teams, organizations, guests} = access
  return (
    <div className='overflow-y-auto pt-3 pb-4'>
      {!isParentLinked && (
        <div className='rounded-md border border-slate-700 p-2 text-sm text-slate-800'>
          Share settings on this page differ from the parent page{' '}
          <a href='#' className='text-slate-700 underline hover:text-sky-400'>
            {parentPage?.title}
          </a>
        </div>
      )}

      <div className='space-y-2'>
        {guests.map(({role, email}) => {
          return (
            <div className='flex items-center justify-between' key={email}>
              <div className='flex items-center gap-3 pr-2'>
                <TeamAvatar className='h-8 w-8' teamId={email} teamName={email} />
                <div className='flex flex-col'>
                  <div className='text-sm font-medium text-slate-700'>{email}</div>
                </div>
              </div>
              <PageAccessCombobox
                defaultRole={role}
                subjectId={email}
                subjectType='external'
                pageId={pageId}
              />
            </div>
          )
        })}
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
        {teams.map(({role, team}) => {
          const {id: teamId, name: teamName} = team
          return (
            <div className='flex items-center justify-between' key={teamId}>
              <div className='flex items-center gap-3 pr-2'>
                <TeamAvatar className='h-8 w-8' teamId={teamId} teamName={teamName} />
                <div className='flex flex-col'>
                  <div className='text-sm font-medium text-slate-700'>{teamName}</div>
                </div>
              </div>
              <PageAccessCombobox
                defaultRole={role}
                subjectId={teamId}
                subjectType='team'
                pageId={pageId}
              />
            </div>
          )
        })}
        {organizations.map(({role, organization}) => {
          const {id: orgId, name: orgName, picture} = organization
          return (
            <div className='flex items-center justify-between' key={orgId}>
              <div className='flex items-center gap-3 pr-2'>
                {picture ? (
                  <Avatar className='h-8 w-8' picture={picture} />
                ) : (
                  <TeamAvatar className='h-8 w-8' teamId={orgId} teamName={orgName} />
                )}
                <div className='flex flex-col'>
                  <div className='text-sm font-medium text-slate-700'>{orgName}</div>
                </div>
              </div>
              <PageAccessCombobox
                defaultRole={role}
                subjectId={orgId}
                subjectType='organization'
                pageId={pageId}
              />
            </div>
          )
        })}
        {access.public && (
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3 pr-2'>
              <PublicIcon className='h-8 w-8' />
              <div className='flex flex-col'>
                <div className='text-sm font-medium text-slate-700'>{'Shared Publicly'}</div>
              </div>
            </div>
            <PageAccessCombobox
              defaultRole={access.public}
              subjectId={'*'}
              subjectType='external'
              pageId={pageId}
            />
          </div>
        )}
      </div>
    </div>
  )
}
