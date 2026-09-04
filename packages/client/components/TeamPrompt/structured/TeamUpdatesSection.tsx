import graphql from 'babel-plugin-relay/macro'
import {type RefObject, useRef} from 'react'
import {useFragment} from 'react-relay'
import type {TeamUpdatesSection_meeting$key} from '~/__generated__/TeamUpdatesSection_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import TeamUpdatesByPerson from './TeamUpdatesByPerson'
import TeamUpdatesByQuestion from './TeamUpdatesByQuestion'
import TeamUpdatesHeader from './TeamUpdatesHeader'
import {sortTeamStages} from './teamPromptStages'
import useOpenResponseDiscussion from './useOpenResponseDiscussion'
import useTeamHeaderPin from './useTeamHeaderPin'
import useTeamLayoutPreference from './useTeamLayoutPreference'

interface Props {
  meetingRef: TeamUpdatesSection_meeting$key
  scrollContainerRef: RefObject<HTMLDivElement | null>
}

const TeamUpdatesSection = (props: Props) => {
  const {meetingRef, scrollContainerRef} = props
  const meeting = useFragment(
    graphql`
      fragment TeamUpdatesSection_meeting on TeamPromptMeeting {
        id
        teamId
        endedAt
        localStageId
        rightDrawerOpen
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
              response {
                ...TeamPromptStructuredResponse_response @relay(mask: false)
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
  const {id: meetingId, teamId, endedAt, prompts} = meeting
  const localStageId = meeting.localStageId ?? null
  const rightDrawerOpen = meeting.rightDrawerOpen ?? null
  const stages = meeting.phases[0]?.stages ?? []
  const [layout, setLayout] = useTeamLayoutPreference(meetingId, teamId)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const viewerStage = stages.find((stage) => stage.teamMember.userId === viewerId)
  const isPinned = useTeamHeaderPin(headerRef, scrollContainerRef, !viewerStage?.response?.isShared)
  const onReply = useOpenResponseDiscussion(meetingId, rightDrawerOpen, localStageId)
  const {shared, drafting, notStarted} = sortTeamStages(stages, viewerId)
  const sharedMembers = shared.map((stage) => stage.teamMember.user)
  const onSeeTeam = () => {
    scrollContainerRef.current?.scrollTo({top: gridRef.current?.offsetTop ?? 0, behavior: 'smooth'})
  }
  return (
    <>
      <TeamUpdatesHeader
        ref={headerRef}
        sharedMembers={sharedMembers}
        draftingCount={drafting.length}
        layout={layout}
        onLayoutChange={setLayout}
        isPinned={isPinned}
        onSeeTeam={onSeeTeam}
      />
      <div ref={gridRef}>
        {layout === 'byQuestion' ? (
          <TeamUpdatesByQuestion
            prompts={prompts}
            sharedStages={shared}
            draftingStages={[...drafting, ...notStarted]}
            teamId={teamId}
            meetingId={meetingId}
            selectedStageId={localStageId}
            onReply={onReply}
          />
        ) : (
          <TeamUpdatesByPerson
            layout={layout}
            prompts={prompts}
            sharedStages={shared}
            draftingStages={drafting}
            notStartedStages={notStarted}
            isEnded={!!endedAt}
            selectedStageId={localStageId}
            onReply={onReply}
          />
        )}
      </div>
    </>
  )
}

export default TeamUpdatesSection
