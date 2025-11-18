import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import {Link} from 'react-router-dom'
import {PageAccessCombobox} from '~/modules/pages/PageAccessCombobox'
import {useUpdatePageAccessMutation} from '~/mutations/useUpdatePageAccessMutation'
import type {PageSharingAccessList_page$key} from '../../__generated__/PageSharingAccessList_page.graphql'
import Avatar from '../../components/Avatar/Avatar'
import TeamAvatar from '../../components/TeamAvatar/TeamAvatar'
import useAtmosphere from '../../hooks/useAtmosphere'
import {useUpdatePageParentLinkMutation} from '../../mutations/useUpdatePageParentLinkMutation'
import {cn} from '../../ui/cn'
import {PageSharingGeneralAccess} from './PageSharingGeneralAccess'
import {PageSharingPendingRequests} from './PageSharingPendingRequests'

graphql`
  fragment PageSharingAccessList_pageAccess on Page {
    ...PageSharingGeneralAccess_page
    ...PageSharingPendingRequests_page
    id
    isParentLinked
    access {
      viewer
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
        id
        parentPageId
      }
    `,
    pageRef
  )
  const {id: pageId, isParentLinked, access, parentPageId} = page
  const {users, teams, organizations, guests, viewer: viewerRole} = access
  const [execute] = useUpdatePageParentLinkMutation()
  const [executeClaimOwnership] = useUpdatePageAccessMutation()
  const isOrphan = useMemo(() => {
    const subjects = [...users, ...teams, ...organizations]
    return !subjects.some((subject) => subject.role === 'owner')
  }, [access])
  const relink = () => {
    execute({
      variables: {
        pageId,
        isParentLinked: true
      }
    })
  }
  const claimOwnership = () => {
    executeClaimOwnership({
      variables: {
        pageId,
        subjectId: viewerId,
        subjectType: 'user',
        unlinkApproved: true,
        role: 'owner'
      }
    })
  }
  return (
    <div className='space-y-2 overflow-y-auto pt-3 pb-4'>
      {!isParentLinked && parentPageId && (
        <div className='mb-2 rounded-md border border-slate-700 p-2 text-slate-800 text-sm'>
          {'Share settings on this page differ from its '}
          <Link
            to={`/pages/${parentPageId.split(':')[1]}`}
            className='font-semibold hover:text-sky-500'
          >
            {'parent page'}
          </Link>
          {'.'}
          <span className={cn('hidden', viewerRole === 'owner' && 'inline')}>
            {' To re-link and inherit parent access, '}
            <span className='cursor-pointer font-semibold hover:text-sky-500' onClick={relink}>
              {'Click here'}
            </span>
          </span>
        </div>
      )}
      {isOrphan && (
        <div className='mb-2 rounded-md border border-slate-700 p-2 text-slate-800 text-sm'>
          {'The owner of this page has left Parabol.'}
          <span className={'inline'}>
            {' To claim ownership, '}
            <span
              className='cursor-pointer font-semibold hover:text-sky-500'
              onClick={claimOwnership}
            >
              {'Click here'}
            </span>
          </span>
        </div>
      )}
      <div className='space-y-4'>
        {guests.map(({role, email}) => {
          return (
            <div className='flex items-center justify-between' key={email}>
              <div className='flex items-center gap-3 pr-2'>
                <TeamAvatar className='mr-0 h-10 w-10' teamId={email} teamName={email} />
                <div className='flex flex-col'>
                  <div className='font-medium text-slate-700 text-sm'>{email}</div>
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
                <Avatar className='h-10 w-10' picture={picture} />
                <div className='flex flex-col'>
                  <div className='font-medium text-slate-700 text-sm'>{name}</div>
                  <div className='text-slate-800 text-xs'>{email}</div>
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
                <TeamAvatar className='mr-0 h-10 w-10' teamId={teamId} teamName={teamName} />
                <div className='flex flex-col'>
                  <div className='font-medium text-slate-700 text-sm'>{teamName}</div>
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
                  <div className='font-medium text-slate-700 text-sm'>{orgName}</div>
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
      </div>
      <PageSharingPendingRequests pageRef={page} />
      <PageSharingGeneralAccess pageRef={page} />
    </div>
  )
}
