import {MoreVert} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {DiscussionDrawerTranscripts_meeting$key} from '../__generated__/DiscussionDrawerTranscripts_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import RemoveTeamMemberIntegrationAuthMutation from '../mutations/RemoveTeamMemberIntegrationAuthMutation'
import {Button} from '../ui/Button/Button'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'
import GDriveClientManager from '../utils/GDriveClientManager'
import GoogleMeetProviderLogo from './GoogleMeetProviderLogo'
import {ZoomSVG} from './ZoomSVG'

interface Props {
  meetingRef?: DiscussionDrawerTranscripts_meeting$key | null
}

const TWO_HOURS_MS = 2 * 60 * 60 * 1000

const DiscussionDrawerTranscripts = ({meetingRef}: Props) => {
  const meeting = useFragment(
    graphql`
      fragment DiscussionDrawerTranscripts_meeting on NewMeeting {
        teamId
        team {
          viewerTeamMember {
            integrations {
              gdrive {
                isActive
                watchExpiresAt
                cloudProvider {
                  id
                  clientId
                }
              }
            }
          }
        }
      }
    `,
    meetingRef ?? null
  )

  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {submitting, onError, onCompleted} = mutationProps

  const teamId = meeting?.teamId ?? ''
  const gdrive = meeting?.team?.viewerTeamMember?.integrations?.gdrive
  const cloudProvider = gdrive?.cloudProvider
  const isActive = gdrive?.isActive ?? false
  const watchExpiresAt = gdrive?.watchExpiresAt
  const isGoogleMeetConnected =
    isActive && !!watchExpiresAt && new Date(watchExpiresAt).getTime() > Date.now() + TWO_HOURS_MS

  const handleGoogleMeetConnect = () => {
    if (!cloudProvider || submitting) return
    GDriveClientManager.openOAuth(
      atmosphere,
      cloudProvider.id,
      cloudProvider.clientId,
      teamId,
      mutationProps
    )
  }

  const handleRemoveIntegration = () => {
    if (submitting) return
    RemoveTeamMemberIntegrationAuthMutation(
      atmosphere,
      {service: 'gdrive', teamId},
      {onError, onCompleted}
    )
  }

  return (
    <div className='flex flex-col gap-4 px-6 py-5'>
      <p className='text-center text-slate-600 text-sm leading-5'>
        Connect a video call provider to automatically import transcripts after your meeting ends.
      </p>
      <div className='flex flex-col gap-2'>
        {cloudProvider && (
          <div className='flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5'>
            <div className='flex items-center gap-2.5'>
              <GoogleMeetProviderLogo />
              <span className='font-medium text-slate-700 text-sm'>Google Meet</span>
            </div>
            {isGoogleMeetConnected ? (
              <div className='flex items-center gap-1'>
                <span className='font-semibold text-jade-500 text-xs'>Connected</span>
                <Menu
                  trigger={
                    <Button variant='ghost' className='h-6 w-6 p-0'>
                      <MoreVert className='text-base text-slate-500' />
                    </Button>
                  }
                >
                  <MenuContent align='end' sideOffset={4}>
                    <MenuItem onSelect={handleRemoveIntegration}>{'Remove integration'}</MenuItem>
                    <MenuItem onSelect={handleGoogleMeetConnect}>{'Refresh auth token'}</MenuItem>
                  </MenuContent>
                </Menu>
              </div>
            ) : (
              <button
                className='cursor-pointer whitespace-nowrap rounded border border-slate-400 bg-transparent px-1.5 py-0.5 font-semibold text-slate-600 text-xs hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50'
                onClick={handleGoogleMeetConnect}
                disabled={submitting}
              >
                {'Connect'}
              </button>
            )}
          </div>
        )}
        <div className='flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 opacity-50'>
          <div className='flex items-center gap-2.5'>
            <div className='h-6 w-6'>
              <ZoomSVG />
            </div>
            <span className='font-medium text-slate-700 text-sm'>Zoom</span>
          </div>
          <span className='rounded bg-slate-100 px-2 py-0.5 text-slate-500 text-xs'>
            {'Coming Soon'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default DiscussionDrawerTranscripts
