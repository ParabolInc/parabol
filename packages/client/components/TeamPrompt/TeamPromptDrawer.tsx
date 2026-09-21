import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, useFragment} from 'react-relay'
import type {TeamPromptDrawer_meeting$key} from '~/__generated__/TeamPromptDrawer_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import {DiscussionThreadEnum} from '../../types/constEnums'
import findStageById from '../../utils/meetings/findStageById'
import DiscussionDrawer from '../DiscussionDrawer'
import ResponsiveDashSidebar from '../ResponsiveDashSidebar'
import {getSharedResponses} from './structured/teamPromptStages'
import TeamPromptDiscussionThreadHeader from './TeamPromptDiscussionThreadHeader'
import TeamPromptWorkDrawer from './TeamPromptWorkDrawer'

interface Props {
  meetingRef: TeamPromptDrawer_meeting$key
}

const TeamPromptDrawer = ({meetingRef}: Props) => {
  const meeting = useFragment(
    graphql`
      fragment TeamPromptDrawer_meeting on TeamPromptMeeting {
        ...TeamPromptWorkDrawer_meeting
        ...DiscussionDrawerTranscripts_meeting
        id
        teamId
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
              responses {
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
  const {id: meetingId, rightDrawerOpen, localStageId, prompts} = meeting

  const onToggleDrawer = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const meetingProxy = store.get(meetingId)
      if (!meetingProxy) return
      const isOpen = meetingProxy.getValue('rightDrawerOpen') !== null
      meetingProxy.setValue(isOpen ? null : 'inspiration', 'rightDrawerOpen')
    })
  }

  const onChangeTab = (tabId: string) => {
    commitLocalUpdate(atmosphere, (store) => {
      store.get(meetingId)?.setValue(tabId, 'rightDrawerOpen')
    })
  }

  const allStages = meeting.phases.flatMap((p) => p.stages)
  const selectedStage = localStageId ? findStageById(meeting.phases, localStageId)?.stage : null
  const activeStage = selectedStage?.discussionId
    ? selectedStage
    : allStages.find(
        (stage) => stage.discussionId && getSharedResponses(stage.responses ?? []).length > 0
      )

  return (
    <ResponsiveDashSidebar
      isOpen={rightDrawerOpen !== null}
      isRightDrawer
      onToggle={onToggleDrawer}
      sidebarWidth={DiscussionThreadEnum.WIDTH}
    >
      <DiscussionDrawer
        discussionId={activeStage?.discussionId}
        onToggle={onToggleDrawer}
        allowedThreadables={['comment', 'task']}
        meetingRef={meeting}
        meetingId={meetingId}
        threadHeader={
          activeStage && (
            <TeamPromptDiscussionThreadHeader stageRef={activeStage} prompts={prompts} />
          )
        }
        workContent={<TeamPromptWorkDrawer meetingRef={meeting} />}
        activeTab={rightDrawerOpen}
        onChangeTab={onChangeTab}
      />
    </ResponsiveDashSidebar>
  )
}

export default TeamPromptDrawer
