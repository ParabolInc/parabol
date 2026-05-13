import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {AddGoogleTranscriptButton_meeting$key} from '../__generated__/AddGoogleTranscriptButton_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import GDriveClientManager from '../utils/GDriveClientManager'

type Props = {
  meetingRef: AddGoogleTranscriptButton_meeting$key
}

const AddGoogleTranscriptButton = (props: Props) => {
  const {meetingRef} = props
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {submitting} = mutationProps

  const meeting = useFragment(
    graphql`
      fragment AddGoogleTranscriptButton_meeting on NewMeeting {
        teamId
        team {
          viewerTeamMember {
            integrations {
              gdrive {
                isActive
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
    meetingRef
  )

  const {teamId, team} = meeting
  const gdrive = team?.viewerTeamMember?.integrations?.gdrive
  const cloudProvider = gdrive?.cloudProvider
  const isActive = gdrive?.isActive ?? false
  console.log({cloudProvider, isActive})
  if (!cloudProvider) return null

  if (isActive) {
    return (
      <span className='px-1.5 py-0.5 font-semibold text-jade-500 text-xs'>
        {'Google Meet Connected'}
      </span>
    )
  }

  const handleClick = () => {
    if (submitting) return
    GDriveClientManager.openOAuth(
      atmosphere,
      cloudProvider.id,
      cloudProvider.clientId,
      teamId,
      mutationProps
    )
  }

  return (
    <button
      className='cursor-pointer whitespace-nowrap rounded border border-slate-400 bg-transparent px-1.5 py-0.5 font-semibold text-slate-600 text-xs hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50'
      onClick={handleClick}
      disabled={submitting}
    >
      {'Add transcripts from Google Meet'}
    </button>
  )
}

export default AddGoogleTranscriptButton
