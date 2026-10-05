import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, useFragment} from 'react-relay'
import type {TeamPromptMobileSheets_meeting$key} from '~/__generated__/TeamPromptMobileSheets_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import findStageById from '../../../utils/meetings/findStageById'
import DiscussionDrawerThread from '../../DiscussionDrawerThread'
import DiscussionDrawerTranscripts from '../../DiscussionDrawerTranscripts'
import TeamPromptDiscussionThreadHeader from '../TeamPromptDiscussionThreadHeader'
import TeamPromptWorkDrawer from '../TeamPromptWorkDrawer'
import TeamPromptMobileSheet from './TeamPromptMobileSheet'

const SHEET_TITLES: Record<string, string> = {
  discussion: 'Discussion',
  inspiration: 'Inspiration',
  transcription: 'Transcription'
}

interface Props {
  meetingRef: TeamPromptMobileSheets_meeting$key
}

const TeamPromptMobileSheets = ({meetingRef}: Props) => {
  const meeting = useFragment(
    graphql`
      fragment TeamPromptMobileSheets_meeting on TeamPromptMeeting {
        ...TeamPromptWorkDrawer_meeting
        ...DiscussionDrawerTranscripts_meeting
        id
        rightDrawerOpen
        localStageId
        prompts {
          id
          question
          groupColor
        }
        phases {
          stages {
            id
            ... on TeamPromptResponseStage {
              ...TeamPromptDiscussionThreadHeader_stage
              discussionId
            }
          }
        }
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()
  const {id: meetingId, rightDrawerOpen, localStageId, prompts} = meeting
  const selectedStage = localStageId ? findStageById(meeting.phases, localStageId)?.stage : null
  const discussionStage = selectedStage?.discussionId ? selectedStage : null
  const openSheet =
    rightDrawerOpen === 'discussion' && !discussionStage ? null : (rightDrawerOpen ?? null)

  const onClose = () => {
    commitLocalUpdate(atmosphere, (store) => {
      store.get(meetingId)?.setValue(null, 'rightDrawerOpen')
    })
  }

  return (
    <TeamPromptMobileSheet
      isOpen={!!openSheet}
      onClose={onClose}
      title={SHEET_TITLES[openSheet ?? ''] ?? ''}
      isFullHeight
    >
      {openSheet === 'inspiration' && <TeamPromptWorkDrawer meetingRef={meeting} />}
      {openSheet === 'transcription' && <DiscussionDrawerTranscripts meetingRef={meeting} />}
      {openSheet === 'discussion' && discussionStage?.discussionId && (
        <DiscussionDrawerThread
          discussionId={discussionStage.discussionId}
          allowedThreadables={['comment', 'task']}
          header={<TeamPromptDiscussionThreadHeader stageRef={discussionStage} prompts={prompts} />}
        />
      )}
    </TeamPromptMobileSheet>
  )
}

export default TeamPromptMobileSheets
