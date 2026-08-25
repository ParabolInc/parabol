import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {DiscussionDrawerTranscripts_meeting$key} from '../__generated__/DiscussionDrawerTranscripts_meeting.graphql'
import DiscussionDrawerGmeetRow from './DiscussionDrawerGmeetRow'
import DiscussionDrawerZoomRow from './DiscussionDrawerZoomRow'

interface Props {
  meetingRef?: DiscussionDrawerTranscripts_meeting$key | null
}

const DiscussionDrawerTranscripts = ({meetingRef}: Props) => {
  const meeting = useFragment(
    graphql`
      fragment DiscussionDrawerTranscripts_meeting on NewMeeting {
        teamId
        team {
          viewerTeamMember {
            integrations {
              gmeet {
                ...DiscussionDrawerGmeetRow_gmeet
              }
              zoom {
                ...DiscussionDrawerZoomRow_zoom
              }
            }
          }
        }
      }
    `,
    meetingRef ?? null
  )

  const teamId = meeting?.teamId ?? ''
  const integrations = meeting?.team?.viewerTeamMember?.integrations

  return (
    <div className='flex flex-col gap-4 px-6 py-5'>
      <p className='text-center text-fg-secondary text-sm leading-5'>
        Connect a video call provider to automatically import transcripts after your meeting ends.
      </p>
      <div className='flex flex-col gap-2'>
        {integrations?.gmeet && (
          <DiscussionDrawerGmeetRow gmeetRef={integrations.gmeet} teamId={teamId} />
        )}
        {integrations?.zoom && (
          <DiscussionDrawerZoomRow zoomRef={integrations.zoom} teamId={teamId} />
        )}
      </div>
    </div>
  )
}

export default DiscussionDrawerTranscripts
