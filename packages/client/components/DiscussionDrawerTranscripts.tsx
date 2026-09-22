import graphql from 'babel-plugin-relay/macro'
import {useContext, useState} from 'react'
import {useFragment} from 'react-relay'
import type {DiscussionDrawerTranscripts_meeting$key} from '../__generated__/DiscussionDrawerTranscripts_meeting.graphql'
import DiscussionDrawerGmeetRow from './DiscussionDrawerGmeetRow'
import DiscussionDrawerZoomRow from './DiscussionDrawerZoomRow'
import ReadOnlyMeetingContext from './ReadOnlyMeetingContext'
import TranscriptionPreviewDialog, {
  type TranscriptionProvider
} from './TeamHealthDemo/TranscriptionPreviewDialog'

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
  const isReadOnly = useContext(ReadOnlyMeetingContext)
  const [previewProvider, setPreviewProvider] = useState<TranscriptionProvider | null>(null)
  const previewConnect = (provider: TranscriptionProvider) =>
    isReadOnly ? () => setPreviewProvider(provider) : undefined

  return (
    <div className='flex flex-col gap-4 px-6 py-5'>
      <p className='text-center text-fg-secondary text-sm leading-5'>
        Connect a video call provider to automatically import transcripts after your meeting ends.
      </p>
      <div className='flex flex-col gap-2'>
        {integrations?.gmeet && (
          <DiscussionDrawerGmeetRow
            gmeetRef={integrations.gmeet}
            teamId={teamId}
            onConnect={previewConnect('Google Meet')}
          />
        )}
        {integrations?.zoom && (
          <DiscussionDrawerZoomRow
            zoomRef={integrations.zoom}
            teamId={teamId}
            onConnect={previewConnect('Zoom')}
          />
        )}
      </div>
      <TranscriptionPreviewDialog
        provider={previewProvider}
        onClose={() => setPreviewProvider(null)}
      />
    </div>
  )
}

export default DiscussionDrawerTranscripts
