import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import {useFragment} from 'react-relay'
import type {RetroTeamHealthResultPhase_meeting$key} from '~/__generated__/RetroTeamHealthResultPhase_meeting.graphql'
import useRightDrawer from '~/hooks/useRightDrawer'
import useTeamHealthCheckConnection from '../../hooks/useTeamHealthCheckConnection'
import {DiscussionThreadEnum} from '../../types/constEnums'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import {getOrderedTeamHealthCategories} from '../ActivityLibrary/TeamHealth/getTeamHealthCategoryColor'
import DiscussionDrawer from '../DiscussionDrawer'
import MeetingContent from '../MeetingContent'
import MeetingHeaderAndPhase from '../MeetingHeaderAndPhase'
import MeetingTopBar from '../MeetingTopBar'
import PhaseHeaderDescription from '../PhaseHeaderDescription'
import PhaseHeaderTitle from '../PhaseHeaderTitle'
import PhaseWrapper from '../PhaseWrapper'
import ResponsiveDashSidebar from '../ResponsiveDashSidebar'
import type {RetroMeetingPhaseProps} from '../RetroMeeting'
import RetroMeetingSettings from '../RetroMeetingSettings/RetroMeetingSettings'
import RetroSettingsSubviews from '../RetroMeetingSettings/RetroSettingsSubviews'
import StageTimerDisplay from '../StageTimerDisplay'
import TeamHealthResultCard from '../TeamHealth/TeamHealthResultCard'

interface Props extends RetroMeetingPhaseProps {
  meeting: RetroTeamHealthResultPhase_meeting$key
}

const RetroTeamHealthResultPhase = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroTeamHealthResultPhase_meeting on RetrospectiveMeeting {
        ...StageTimerDisplay_meeting
        ...DiscussionDrawerTranscripts_meeting
        ...RetroMeetingSettings_meeting
        ...RetroSettingsSubviews_meeting
        id
        endedAt
        showSidebar
        rightDrawerOpen
        localStage {
          id
          ...RetroTeamHealthResultPhase_stage @relay(mask: false)
        }
        phases {
          phaseType
          stages {
            id
            ...RetroTeamHealthResultPhase_stage @relay(mask: false)
          }
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, endedAt, showSidebar, rightDrawerOpen, localStage, phases} = meeting
  const [toggleDrawer, setActiveTab] = useRightDrawer(meetingId)
  const {resultStage, teamHealthMeeting} = localStage
  useTeamHealthCheckConnection(teamHealthMeeting?.id, false)
  if (!resultStage || !teamHealthMeeting) return null
  const resultStages =
    phases.find(({phaseType}) => phaseType === 'TEAM_HEALTH_CHECK_RESULT')?.stages ?? []
  const orderedCategoryIds = getOrderedTeamHealthCategories(
    teamHealthMeeting.template?.availableQuestionPacks ?? []
  ).map(({id}) => id)
  const revealedAt = teamHealthMeeting.endedAt
    ? ` · revealed ${dayjs(teamHealthMeeting.endedAt).format('MMM D')}`
    : ''
  // the check's thread stays open after its reveal, for whoever took part in the check
  const canComment = !!teamHealthMeeting.viewerMeetingMember && !endedAt
  return (
    <MeetingContent>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
          rightDrawerOpen={rightDrawerOpen}
          toggleDrawer={toggleDrawer}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.TEAM_HEALTH_CHECK_RESULT}</PhaseHeaderTitle>
          <PhaseHeaderDescription>{`${teamHealthMeeting.name}${revealedAt}`}</PhaseHeaderDescription>
        </MeetingTopBar>
        <PhaseWrapper>
          <div className='flex min-h-0 w-full flex-1 flex-col overflow-y-auto'>
            <div className='m-auto flex w-full flex-col items-center'>
              <StageTimerDisplay meeting={meeting} />
              <div className='w-full max-w-3xl px-6 py-6'>
                <TeamHealthResultCard
                  key={resultStage.id}
                  stage={resultStage}
                  stageIndex={resultStages.findIndex(({id}) => id === localStage.id)}
                  stageCount={resultStages.length}
                  orderedCategoryIds={orderedCategoryIds}
                />
              </div>
            </div>
          </div>
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
      <ResponsiveDashSidebar
        isOpen={rightDrawerOpen != null}
        isRightDrawer
        onToggle={toggleDrawer}
        sidebarWidth={DiscussionThreadEnum.WIDTH}
      >
        <RetroSettingsSubviews
          meetingRef={meeting}
          activeTab={rightDrawerOpen}
          onChangeTab={setActiveTab}
          onClose={toggleDrawer}
        >
          <DiscussionDrawer
            discussionId={resultStage.discussionId}
            onToggle={toggleDrawer}
            allowedThreadables={canComment ? ['comment', 'task', 'poll'] : []}
            meetingRef={meeting}
            meetingId={meetingId}
            settingsContent={
              <RetroMeetingSettings meetingRef={meeting} onOpenSubview={setActiveTab} />
            }
            activeTab={rightDrawerOpen}
            onChangeTab={setActiveTab}
          />
        </RetroSettingsSubviews>
      </ResponsiveDashSidebar>
    </MeetingContent>
  )
}

// a stage's data comes from the meeting's phases, since the local stage is only a pointer into them
graphql`
  fragment RetroTeamHealthResultPhase_stage on NewMeetingStage {
    ... on TeamHealthCheckResultStage {
      resultStage {
        id
        discussionId
        ...TeamHealthResultCard_stage
      }
      teamHealthMeeting {
        id
        name
        endedAt
        viewerMeetingMember {
          id
        }
        template {
          availableQuestionPacks {
            questions {
              category {
                id
                name
                createdAt
              }
            }
          }
        }
      }
    }
  }
`

export default RetroTeamHealthResultPhase
