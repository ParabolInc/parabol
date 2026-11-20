import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroSidebarTeamHealthResultSection_meeting$key} from '~/__generated__/RetroSidebarTeamHealthResultSection_meeting.graphql'
import useAnimatedPhaseListChildren from '../../hooks/useAnimatedPhaseListChildren'
import useAtmosphere from '../../hooks/useAtmosphere'
import type useGotoStageId from '../../hooks/useGotoStageId'
import {cn} from '../../ui/cn'
import {
  getOrderedTeamHealthCategories,
  getTeamHealthCategoryDotColor
} from '../ActivityLibrary/TeamHealth/getTeamHealthCategoryColor'
import MeetingSidebarPhaseItemChild from '../MeetingSidebarPhaseItemChild'
import MeetingSubnavItem from '../MeetingSubnavItem'
import TeamHealthScoreDelta from '../TeamHealth/TeamHealthScoreDelta'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  meeting: RetroSidebarTeamHealthResultSection_meeting$key
}

const RetroSidebarTeamHealthResultSection = (props: Props) => {
  const {gotoStageId, handleMenuClick, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroSidebarTeamHealthResultSection_meeting on RetrospectiveMeeting {
        facilitatorUserId
        localPhase {
          phaseType
        }
        localStage {
          id
        }
        phases {
          phaseType
          stages {
            id
            isNavigable
            isNavigableByFacilitator
            ... on TeamHealthCheckResultStage {
              resultStage {
                score
                respondentCount
                scoreHistory {
                  score
                }
                healthQuestion: question {
                  category {
                    id
                    name
                  }
                }
              }
              teamHealthMeeting {
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
        }
      }
    `,
    meetingRef
  )
  const {viewerId} = useAtmosphere()
  const {facilitatorUserId, localPhase, localStage, phases} = meeting
  const stages =
    phases.find(({phaseType}) => phaseType === 'TEAM_HEALTH_CHECK_RESULT')?.stages ?? []
  const packs = stages[0]?.teamHealthMeeting?.template?.availableQuestionPacks ?? []
  const orderedCategoryIds = getOrderedTeamHealthCategories(packs).map(({id}) => id)
  const isViewerFacilitator = viewerId === facilitatorUserId
  const isActive = localPhase?.phaseType === 'TEAM_HEALTH_CHECK_RESULT'
  const {height, ref} = useAnimatedPhaseListChildren(isActive, stages.length)
  return (
    <MeetingSidebarPhaseItemChild minHeight={height} height={height}>
      <div
        className={cn(
          'flex h-full w-full flex-col pb-2',
          isActive ? 'overflow-auto' : 'overflow-hidden'
        )}
        ref={ref}
      >
        {stages.map(({id: stageId, isNavigable, isNavigableByFacilitator, resultStage}) => {
          if (!resultStage) return null
          const {score, respondentCount, scoreHistory, healthQuestion} = resultStage
          const {category} = healthQuestion
          const canNavigate = isViewerFacilitator ? isNavigableByFacilitator : isNavigable
          return (
            <MeetingSubnavItem
              key={stageId}
              isActive={localStage?.id === stageId}
              isDisabled={!canNavigate}
              isDragging={false}
              isUnsyncedFacilitatorStage={false}
              metaContent={
                <TeamHealthScoreDelta
                  score={score}
                  respondentCount={respondentCount}
                  previousScore={scoreHistory.at(-1)?.score}
                  isCompact
                />
              }
              onClick={() => {
                gotoStageId(stageId).catch(() => {})
                handleMenuClick()
              }}
            >
              <div className='flex items-center gap-2'>
                <span
                  className={cn(
                    'size-2 shrink-0 rounded-full',
                    getTeamHealthCategoryDotColor(category.id, orderedCategoryIds)
                  )}
                />
                {category.name}
              </div>
            </MeetingSubnavItem>
          )
        })}
      </div>
    </MeetingSidebarPhaseItemChild>
  )
}

export default RetroSidebarTeamHealthResultSection
