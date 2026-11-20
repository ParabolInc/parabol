import {useNavigate} from '@tanstack/react-router'
import graphql from 'babel-plugin-relay/macro'
import {Fragment, useState} from 'react'
import {useFragment} from 'react-relay'
import type {
  NewMeetingPhaseTypeEnum,
  RetroMeetingSidebar_meeting$key
} from '~/__generated__/RetroMeetingSidebar_meeting.graphql'
import isDemoRoute from '~/utils/isDemoRoute'
import useAtmosphere from '../hooks/useAtmosphere'
import type useGotoStageId from '../hooks/useGotoStageId'
import {GQLID} from '../utils/GQLID'
import getSidebarItemStage from '../utils/getSidebarItemStage'
import findStageById from '../utils/meetings/findStageById'
import isPhaseComplete from '../utils/meetings/isPhaseComplete'
import MeetingNavList from './MeetingNavList'
import NewMeetingSidebar from './NewMeetingSidebar'
import NewMeetingSidebarPhaseListItem from './NewMeetingSidebarPhaseListItem'
import RetroSidebarPhaseListItemChildren from './RetroSidebarPhaseListItemChildren'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  toggleSidebar: () => void
  meeting: RetroMeetingSidebar_meeting$key
}

const collapsiblePhases: NewMeetingPhaseTypeEnum[] = [
  'checkin',
  'updates',
  'discuss',
  'TEAM_HEALTH_CHECK_RESULT'
]

const retroPhaseLabelOverrides: Partial<Record<NewMeetingPhaseTypeEnum, string>> = {
  updates: 'Review Tasks'
}

const RetroMeetingSidebar = (props: Props) => {
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const {viewerId} = atmosphere
  const {gotoStageId, handleMenuClick, toggleSidebar, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroMeetingSidebar_meeting on RetrospectiveMeeting {
        ...RetroSidebarPhaseListItemChildren_meeting
        ...NewMeetingSidebar_meeting
        showSidebar
        id
        endedAt
        facilitatorUserId
        facilitatorStageId
        localPhase {
          phaseType
        }
        localStage {
          id
        }
        meetingMembers {
          id
        }
        phases {
          phaseType
          stages {
            id
            isComplete
            isNavigable
            isNavigableByFacilitator
            readyUserIds
            ... on TeamHealthCheckStage {
              openTeamHealthMeeting {
                localStage {
                  phaseType
                }
                phases {
                  phaseType
                  stages {
                    id
                    phaseType
                  }
                }
              }
            }
          }
        }
        summaryPageId
      }
    `,
    meetingRef
  )
  const {
    id: meetingId,
    endedAt,
    facilitatorUserId,
    facilitatorStageId,
    localPhase,
    localStage,
    phases,
    meetingMembers,
    summaryPageId
  } = meeting
  const localPhaseType = localPhase ? localPhase.phaseType : ''
  const facilitatorStageRes = findStageById(phases, facilitatorStageId)
  const facilitatorPhaseType = facilitatorStageRes ? facilitatorStageRes.phase.phaseType : ''
  const isViewerFacilitator = facilitatorUserId === viewerId
  const isUnsyncedFacilitatorPhase = facilitatorPhaseType !== localPhaseType
  const isUnsyncedFacilitatorStage = localStage ? localStage.id !== facilitatorStageId : undefined
  const [confirmingPhase, setConfirmingPhase] = useState<NewMeetingPhaseTypeEnum | null>(null)
  const teamHealthCheck = phases.find(({phaseType}) => phaseType === 'TEAM_HEALTH_CHECK')?.stages[0]
    ?.openTeamHealthMeeting
  const isAnsweringTeamHealth = teamHealthCheck?.localStage?.phaseType === 'TEAM_HEALTH_RESPONSE'
  const teamHealthQuestionCount = teamHealthCheck?.phases.find(
    ({phaseType}) => phaseType === 'TEAM_HEALTH_RESPONSE'
  )?.stages.length
  return (
    <NewMeetingSidebar
      handleMenuClick={handleMenuClick}
      toggleSidebar={toggleSidebar}
      meeting={meeting}
    >
      <MeetingNavList>
        {phases.map(({phaseType}, index) => {
          const itemStage = getSidebarItemStage(phaseType, phases, facilitatorStageId)
          const {
            id: itemStageId = '',
            isNavigable = false,
            isNavigableByFacilitator = false,
            isComplete = false
          } = itemStage ?? {}
          const canNavigate = isViewerFacilitator ? isNavigableByFacilitator : isNavigable
          const handleClick = () => {
            const prevPhaseType = phases[index - 1]?.phaseType
            const prevItemStage = prevPhaseType
              ? getSidebarItemStage(prevPhaseType, phases, facilitatorStageId)
              : null

            const {isComplete: isPrevItemStageComplete = true, readyUserIds = []} =
              prevItemStage ?? {}

            const activeCount = meetingMembers.length
            const isConfirmRequired =
              isViewerFacilitator && readyUserIds.length < activeCount - 1 && activeCount > 1

            if (
              isComplete ||
              isPrevItemStageComplete ||
              !isConfirmRequired ||
              confirmingPhase === phaseType
            ) {
              setConfirmingPhase(null)
              gotoStageId(itemStageId).catch(() => {
                /*ignore*/
              })
              handleMenuClick()
            } else {
              setConfirmingPhase(phaseType)
            }
          }
          const discussPhase = phases.find((phase) => {
            return phase.phaseType === 'discuss'
          })!
          const showDiscussSection = isPhaseComplete('vote', phases)
          const phaseCount =
            phaseType === 'discuss'
              ? showDiscussSection
                ? discussPhase?.stages.length
                : undefined
              : phaseType === 'TEAM_HEALTH_CHECK'
                ? teamHealthQuestionCount
                : phaseType === 'TEAM_HEALTH_CHECK_RESULT'
                  ? phases.find((phase) => phase.phaseType === phaseType)?.stages.length ||
                    undefined
                  : undefined
          return (
            <Fragment key={phaseType}>
              <NewMeetingSidebarPhaseListItem
                handleClick={canNavigate ? handleClick : undefined}
                isActive={
                  collapsiblePhases.includes(phaseType)
                    ? false
                    : phaseType === 'TEAM_HEALTH_CHECK'
                      ? localPhaseType === phaseType && !isAnsweringTeamHealth
                      : localPhaseType === phaseType
                }
                isCollapsible={collapsiblePhases.includes(phaseType)}
                isFacilitatorPhase={phaseType === facilitatorPhaseType}
                isUnsyncedFacilitatorPhase={
                  isUnsyncedFacilitatorPhase && phaseType === facilitatorPhaseType
                }
                isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
                key={phaseType}
                phaseCount={phaseCount}
                phaseLabel={retroPhaseLabelOverrides[phaseType]}
                phaseType={phaseType}
                isConfirming={isViewerFacilitator && confirmingPhase === phaseType}
              />
              <RetroSidebarPhaseListItemChildren
                gotoStageId={gotoStageId}
                handleMenuClick={handleMenuClick}
                phaseType={phaseType}
                meeting={meeting}
              />
            </Fragment>
          )
        })}
        {endedAt && (
          <NewMeetingSidebarPhaseListItem
            key='summary'
            isActive={false}
            isFacilitatorPhase={false}
            isUnsyncedFacilitatorPhase={false}
            handleClick={() => {
              if (isDemoRoute()) {
                navigate({to: '/retrospective-demo-summary'})
              } else {
                const summaryURL = summaryPageId
                  ? `/pages/${GQLID.fromKey(summaryPageId)[0]}`
                  : `/new-summary/${meetingId}`
                navigate({href: summaryURL})
              }
            }}
            phaseType='SUMMARY'
          />
        )}
      </MeetingNavList>
    </NewMeetingSidebar>
  )
}

export default RetroMeetingSidebar
