import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {useLocation} from 'react-router'
import type {TeamPromptMobileMeeting_meeting$key} from '~/__generated__/TeamPromptMobileMeeting_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import {cn} from '../../../ui/cn'
import TeamPromptSharedResponseCard from '../structured/TeamPromptSharedResponseCard'
import {getMemberSharedAt, sortTeamStages} from '../structured/teamPromptStages'
import useOpenResponseDiscussion from '../structured/useOpenResponseDiscussion'
import useTeamLayoutPreference from '../structured/useTeamLayoutPreference'
import {TeamPromptMeetingStatus} from '../TeamPromptMeetingStatus'
import TeamPromptMobileComposer from './TeamPromptMobileComposer'
import TeamPromptMobileTabs, {type TeamPromptMobileTab} from './TeamPromptMobileTabs'
import TeamPromptMobileTeam from './TeamPromptMobileTeam'

interface Props {
  meetingRef: TeamPromptMobileMeeting_meeting$key
}

const TeamPromptMobileMeeting = ({meetingRef}: Props) => {
  const meeting = useFragment(
    graphql`
      fragment TeamPromptMobileMeeting_meeting on TeamPromptMeeting {
        ...TeamPromptMobileComposer_meeting
        ...TeamPromptMeetingStatus_meeting
        id
        teamId
        endedAt
        scheduledEndTime
        prompts {
          id
          question
          groupColor
        }
        phases {
          ... on TeamPromptResponsesPhase {
            stages {
              id
              ...TeamPromptSharedResponseCard_stage
              ...TeamUpdatesQuestionRow_stage
              teamMember {
                userId
                user {
                  id
                  preferredName
                  picture
                }
              }
              responses {
                promptId
                sharedAt
                updatedAt
              }
            }
          }
        }
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {id: meetingId, teamId, endedAt, scheduledEndTime, prompts} = meeting
  const stages = meeting.phases[0]?.stages ?? []
  const viewerStage = stages.find((stage) => stage.teamMember.userId === viewerId)
  const hasViewerShared = !!getMemberSharedAt(viewerStage?.responses ?? [])
  const {shared, waiting} = sortTeamStages(stages, viewerId)
  const location = useLocation()
  const hasResponseLink = new URLSearchParams(location.search).has('responseId')
  const [activeTab, setActiveTab] = useState<TeamPromptMobileTab>(
    hasViewerShared || !!endedAt || hasResponseLink || !viewerStage ? 'team' : 'mine'
  )
  const [layout, setLayout] = useTeamLayoutPreference(meetingId, teamId)
  const onReply = useOpenResponseDiscussion(meetingId, null, null)
  const onOpenInspiration = () => {
    commitLocalUpdate(atmosphere, (store) => {
      store.get(meetingId)?.setValue('inspiration', 'rightDrawerOpen')
    })
  }
  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      {(!!endedAt || !!scheduledEndTime) && (
        <div className='flex shrink-0 justify-center px-3 pb-2'>
          <TeamPromptMeetingStatus meetingRef={meeting} />
        </div>
      )}
      <TeamPromptMobileTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        hasViewerShared={hasViewerShared}
        sharedCount={shared.length + (hasViewerShared ? 1 : 0)}
        memberCount={stages.length}
      />
      <div
        role='tabpanel'
        id='standup-panel-mine'
        aria-labelledby='standup-tab-mine'
        className={cn('flex min-h-0 flex-1 flex-col', activeTab !== 'mine' && 'hidden')}
      >
        <TeamPromptMobileComposer
          meetingRef={meeting}
          onOpenInspiration={onOpenInspiration}
          renderSharedCard={(editAction) =>
            viewerStage && (
              <TeamPromptSharedResponseCard
                stageRef={viewerStage}
                prompts={prompts}
                isSelected={false}
                onReply={onReply}
                title='Your update'
                footerAction={editAction}
              />
            )
          }
        />
      </div>
      <div
        role='tabpanel'
        id='standup-panel-team'
        aria-labelledby='standup-tab-team'
        className={cn('flex min-h-0 flex-1 flex-col', activeTab !== 'team' && 'hidden')}
      >
        <TeamPromptMobileTeam
          layout={layout}
          onLayoutChange={setLayout}
          prompts={prompts}
          viewerStage={hasViewerShared && viewerStage ? viewerStage : null}
          sharedStages={shared}
          waitingStages={waiting}
          isEnded={!!endedAt}
          onReply={onReply}
        />
      </div>
    </div>
  )
}

export default TeamPromptMobileMeeting
