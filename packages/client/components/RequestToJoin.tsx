import {Lock, MailOutline} from '@mui/icons-material'
import {useState} from 'react'
import {useRouteMatch} from 'react-router'
import {PushInvitationMutation$data} from '../__generated__/PushInvitationMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import PushInvitationMutation from '../mutations/PushInvitationMutation'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import PrimaryButton from './PrimaryButton'

const RequestToJoinComponent = () => {
  const atmosphere = useAtmosphere()
  const match = useRouteMatch<{teamId: string}>('/team/:teamId')
  const teamId = match?.params.teamId
  const [isRequestSent, setIsRequestSent] = useState(false)
  const {onError, onCompleted, error} = useMutationProps()

  const handleRequestJoin = () => {
    if (!teamId) return
    SendClientSideEvent(atmosphere, 'Sent request to join from public teams', {teamId})
    PushInvitationMutation(
      atmosphere,
      {teamId},
      {
        onError,
        onCompleted: (res: PushInvitationMutation$data) => {
          if (res.pushInvitation?.error) {
            const error = new Error(res.pushInvitation?.error?.message)
            onError(error)
          } else {
            setIsRequestSent(true)
            onCompleted()
          }
        }
      }
    )
  }

  return (
    <div className='relative z-10 flex h-full w-full flex-col items-center justify-center overflow-y-auto'>
      <div className='mb-20 flex max-h-[90vh] w-[50%] max-w-[calc(100vw-48px)] min-w-[280px] flex-col items-center rounded-sm bg-white p-8 shadow-2xl'>
        {isRequestSent ? (
          <MailOutline className='text-purple-500 h-10 w-10 rounded-full' />
        ) : (
          <Lock className='text-purple-500 h-10 w-10 rounded-full' />
        )}
        <div className='text-gray-700 my-4 flex flex-col items-center justify-between text-sm leading-5 font-semibold'>
          {isRequestSent ? 'Request Sent' : 'Request to Join'}
        </div>
        <div className='my-2 mb-7 px-16 text-center text-sm leading-5'>
          {isRequestSent
            ? 'Your request to join the team has been sent.'
            : "You're not a member of this team yet. Click below to request to join the team."}
        </div>
        {!isRequestSent && (
          <PrimaryButton onClick={handleRequestJoin}>{'Request to Join'}</PrimaryButton>
        )}
        {error?.message && (
          <div className='mt-4 text-center font-semibold text-tomato-600'>{error.message}</div>
        )}
      </div>
    </div>
  )
}

export default RequestToJoinComponent
