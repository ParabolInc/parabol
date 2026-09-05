import graphql from 'babel-plugin-relay/macro'
import {type RefObject, useRef} from 'react'
import {useFragment} from 'react-relay'
import type {TeamUpdatesSection_meeting$key} from '~/__generated__/TeamUpdatesSection_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import usePhoneViewport from '~/hooks/usePhoneViewport'
import TeamUpdatesByPersonPhone from './mobile/TeamUpdatesByPersonPhone'
import TeamUpdatesByQuestionPhone from './mobile/TeamUpdatesByQuestionPhone'
import TeamUpdatesPhoneHeader from './mobile/TeamUpdatesPhoneHeader'
import TeamUpdatesByPerson from './TeamUpdatesByPerson'
import TeamUpdatesByQuestion from './TeamUpdatesByQuestion'
import TeamUpdatesHeader from './TeamUpdatesHeader'
import {sortTeamStages} from './teamPromptStages'
import useOpenResponseDiscussion from './useOpenResponseDiscussion'
import useTeamHeaderPin from './useTeamHeaderPin'
import useTeamLayoutPreference, {
  nextLayoutForPhoneChoice,
  toPhoneLayout
} from './useTeamLayoutPreference'

interface Props {
  meetingRef: TeamUpdatesSection_meeting$key
  scrollContainerRef: RefObject<HTMLDivElement | null>
  composerRef: RefObject<HTMLDivElement | null>
  sectionRef: RefObject<HTMLDivElement>
}

const TeamUpdatesSection = (props: Props) => {
  const {meetingRef, scrollContainerRef, composerRef, sectionRef} = props
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
  const isPhone = usePhoneViewport()
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const viewerStage = stages.find((stage) => stage.teamMember.userId === viewerId)
  const {shared, drafting, notStarted} = sortTeamStages(stages, viewerId)
  const canPin = !isPhone && !endedAt && !viewerStage?.response?.isShared && shared.length > 0
  const isPinned = useTeamHeaderPin(headerRef, scrollContainerRef, composerRef, sectionRef, canPin)
  const onReply = useOpenResponseDiscussion(meetingId, rightDrawerOpen, localStageId)
  const selectedStageId = rightDrawerOpen === 'discussion' ? localStageId : null
  const sharedMembers = shared.map((stage) => stage.teamMember.user)
  const onSeeTeam = () => {
    scrollContainerRef.current?.scrollTo({top: gridRef.current?.offsetTop ?? 0, behavior: 'smooth'})
  }
  return (
    <div ref={sectionRef} className='@container'>
      {isPhone ? (
        <TeamUpdatesPhoneHeader
          sharedCount={shared.length}
          draftingCount={drafting.length}
          layout={toPhoneLayout(layout)}
          onLayoutChange={(choice) => {
            const next = nextLayoutForPhoneChoice(layout, choice)
            if (next) setLayout(next)
          }}
        />
      ) : (
        <TeamUpdatesHeader
          ref={headerRef}
          sharedMembers={sharedMembers}
          draftingCount={drafting.length}
          layout={layout}
          onLayoutChange={setLayout}
          canPin={canPin}
          isPinned={isPinned}
          onSeeTeam={onSeeTeam}
        />
      )}
      <div ref={gridRef}>
        {layout === 'byQuestion' ? (
          isPhone ? (
            <TeamUpdatesByQuestionPhone
              prompts={prompts}
              sharedStages={shared}
              draftingStages={[...drafting, ...notStarted]}
              isEnded={!!endedAt}
              selectedStageId={selectedStageId}
              onReply={onReply}
            />
          ) : (
            <TeamUpdatesByQuestion
              prompts={prompts}
              sharedStages={shared}
              draftingStages={[...drafting, ...notStarted]}
              isEnded={!!endedAt}
              selectedStageId={selectedStageId}
              onReply={onReply}
            />
          )
        ) : isPhone ? (
          <TeamUpdatesByPersonPhone
            prompts={prompts}
            sharedStages={shared}
            draftingStages={drafting}
            notStartedStages={notStarted}
            isEnded={!!endedAt}
            selectedStageId={selectedStageId}
            onReply={onReply}
            scrollContainerRef={scrollContainerRef}
          />
        ) : (
          <TeamUpdatesByPerson
            layout={layout}
            prompts={prompts}
            sharedStages={shared}
            draftingStages={drafting}
            notStartedStages={notStarted}
            isEnded={!!endedAt}
            selectedStageId={selectedStageId}
            onReply={onReply}
          />
        )}
      </div>
    </div>
  )
}

export default TeamUpdatesSection
