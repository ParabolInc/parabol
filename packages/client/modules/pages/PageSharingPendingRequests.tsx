import AddIcon from '@mui/icons-material/Add'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {
  PageRoleEnum,
  PageSharingPendingRequests_page$key
} from '../../__generated__/PageSharingPendingRequests_page.graphql'
import Avatar from '../../components/Avatar/Avatar'
import {useUpdatePageAccessMutation} from '../../mutations/useUpdatePageAccessMutation'
import {Button} from '../../ui/Button/Button'

interface Props {
  pageRef: PageSharingPendingRequests_page$key
}

export const PageSharingPendingRequests = (props: Props) => {
  const {pageRef} = props
  const page = useFragment(
    graphql`
      fragment PageSharingPendingRequests_page on Page {
        id
        access {
          pendingRequests {
            user {
              id
              preferredName
              email
              picture
            }
            role
            reason
          }
        }
      }
    `,
    pageRef
  )
  const {id: pageId, access} = page
  const {pendingRequests} = access
  const [execute, submitting] = useUpdatePageAccessMutation()

  const acceptRequest = (userId: string, role: PageRoleEnum) => {
    if (submitting) return
    execute({
      variables: {
        pageId,
        role,
        subjectId: userId,
        subjectType: 'user',
        unlinkApproved: false
      }
    })
  }

  if (pendingRequests.length === 0) {
    return null
  }
  return (
    <>
      <div className='p-2 font-semibold text-slate-600 text-sm'>Pending requests...</div>
      <div className='space-y-4'>
        {pendingRequests.map((request) => {
          const {user, role, reason} = request
          const {id: userId, preferredName: name, email, picture} = user
          return (
            <div key={userId} className='flex items-start justify-between'>
              <div className='flex items-start gap-3 pr-2'>
                <Avatar className='h-10 w-10' picture={picture} />
                <div className='flex flex-col py-0.5'>
                  <div className='font-medium text-slate-700 text-sm'>{name}</div>
                  <div className='text-slate-800 text-xs'>{email}</div>
                  {reason && <div className='pt-2 text-slate-800 text-sm italic'>{reason}</div>}
                </div>
              </div>

              <Button
                variant='outline'
                shape='pill'
                className='mt-1 flex items-center gap-1 pr-4 pl-3 text-slate-700'
                onClick={() => acceptRequest(userId, role)}
                disabled={submitting}
              >
                <AddIcon className='h-6 w-6' />
                Add {role}
              </Button>
            </div>
          )
        })}
      </div>
    </>
  )
}
