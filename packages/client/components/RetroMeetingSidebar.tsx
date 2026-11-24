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

const collapsiblePhases: NewMeetingPhaseTypeEnum[] = ['checkin', 'updates', 'discuss']

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
          }
        }
        teamHealthMeeting {
          endedAt
          localPhase {
            phaseType
          }
          phases {
            phaseType
            stages {
              id
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
    summaryPageId,
    teamHealthMeeting
  } = meeting
  const localPhaseType = localPhase ? localPhase.phaseType : ''
  const facilitatorStageRes = findStageById(phases, facilitatorStageId)
  const facilitatorPhaseType = facilitatorStageRes ? facilitatorStageRes.phase.phaseType : ''
  const isViewerFacilitator = facilitatorUserId === viewerId
  const isUnsyncedFacilitatorPhase = facilitatorPhaseType !== localPhaseType
  const isUnsyncedFacilitatorStage = localStage ? localStage.id !== facilitatorStageId : undefined
  const [confirmingPhase, setConfirmingPhase] = useState<NewMeetingPhaseTypeEnum | null>(null)
  // beneath Team Health are the check's questions, or its results once revealed. Either one, while the
  // viewer is on it, carries the active state
  const checkPhaseType = teamHealthMeeting?.endedAt ? 'TEAM_HEALTH_RESULT' : 'TEAM_HEALTH_RESPONSE'
  const checkStageCount = teamHealthMeeting?.phases.find(
    ({phaseType}) => phaseType === checkPhaseType
  )?.stages.length
  const isOnCheckStage = teamHealthMeeting?.localPhase?.phaseType === checkPhaseType
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
            phaseType === 'discuss' && showDiscussSection
              ? discussPhase?.stages.length
              : phaseType === 'TEAM_HEALTH'
                ? checkStageCount
                : undefined
          return (
            <Fragment key={phaseType}>
              <NewMeetingSidebarPhaseListItem
                handleClick={canNavigate ? handleClick : undefined}
                isActive={
                  phaseType === 'discuss' || phaseType === 'checkin' || phaseType === 'updates'
                    ? false
                    : localPhaseType === phaseType &&
                      !(phaseType === 'TEAM_HEALTH' && isOnCheckStage)
                }
                isCollapsible={
                  collapsiblePhases.includes(phaseType) ||
                  (phaseType === 'TEAM_HEALTH' && !!teamHealthMeeting)
                }
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
