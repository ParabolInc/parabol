import graphql from 'babel-plugin-relay/macro'
import React, {Fragment, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import useRouter from '~/hooks/useRouter'
import isDemoRoute from '~/utils/isDemoRoute'
import {
  NewMeetingPhaseTypeEnum,
  RetroMeetingSidebar_meeting
} from '~/__generated__/RetroMeetingSidebar_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useGotoStageId from '../hooks/useGotoStageId'
import useMutationProps from '../hooks/useMutationProps'
import UpdateMaxPhaseIndexMutation from '../mutations/UpdateMaxPhaseIndexMutation'
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
  meeting: RetroMeetingSidebar_meeting
}

const collapsiblePhases: NewMeetingPhaseTypeEnum[] = ['checkin', 'discuss']

const RetroMeetingSidebar = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {viewerId} = atmosphere
  const {gotoStageId, handleMenuClick, toggleSidebar, meeting} = props
  const {
    id: meetingId,
    endedAt,
    facilitatorUserId,
    facilitatorStageId,
    localPhase,
    localStage,
    phases,
    settings,
    meetingMembers,
    maxPhaseIndex
  } = meeting
  const {phaseTypes} = settings
  const localPhaseType = localPhase ? localPhase.phaseType : ''
  const facilitatorStageRes = findStageById(phases, facilitatorStageId)
  const facilitatorPhaseType = facilitatorStageRes ? facilitatorStageRes.phase.phaseType : ''
  const isViewerFacilitator = facilitatorUserId === viewerId
  const isUnsyncedFacilitatorPhase = facilitatorPhaseType !== localPhaseType
  const isUnsyncedFacilitatorStage = localStage ? localStage.id !== facilitatorStageId : undefined
  const [confirmingPhase, setConfirmingPhase] = useState<NewMeetingPhaseTypeEnum | null>(null)
  const {onError, onCompleted} = useMutationProps()
  return (
    <NewMeetingSidebar
      handleMenuClick={handleMenuClick}
      toggleSidebar={toggleSidebar}
      meeting={meeting}
    >
      <MeetingNavList>
        {phaseTypes.map((phaseType, index) => {
          const itemStage = getSidebarItemStage(phaseType, phases, facilitatorStageId)
          const {
            id: itemStageId = '',
            isNavigable = false,
            isNavigableByFacilitator = false,
            isComplete = false
          } = itemStage ?? {}
          const canNavigate = isViewerFacilitator ? isNavigableByFacilitator : isNavigable
          const handleClick = () => {
            const prevPhaseType = phaseTypes[index - 1]
            const prevItemStage = prevPhaseType
              ? getSidebarItemStage(prevPhaseType, phases, facilitatorStageId)
              : null

            const {isComplete: isPrevItemStageComplete = true, readyCount = 0} = prevItemStage ?? {}

            const activeCount = meetingMembers.length
            const isConfirmRequired = readyCount < activeCount - 1 && activeCount > 1

            if (
              isComplete ||
              isPrevItemStageComplete ||
              !isConfirmRequired ||
              confirmingPhase === phaseType
            ) {
              setConfirmingPhase(null)
              gotoStageId(itemStageId).catch()
              handleMenuClick()
              if (index === maxPhaseIndex! + 1) {
                const currentPhaseIndex = index
                UpdateMaxPhaseIndexMutation(
                  atmosphere,
                  {meetingId, currentPhaseIndex},
                  {onError, onCompleted}
                )
              }
            } else {
              setConfirmingPhase(phaseType)
            }
          }
          const discussPhase = phases.find((phase) => {
            return phase.phaseType === 'discuss'
          })!
          const showDiscussSection = isPhaseComplete('vote', phases)
          const phaseCount =
            phaseType === 'discuss' && showDiscussSection ? discussPhase?.stages.length : undefined
          return (
            <Fragment key={phaseType}>
              <NewMeetingSidebarPhaseListItem
                handleClick={canNavigate ? handleClick : undefined}
                isActive={phaseType === 'discuss' ? false : localPhaseType === phaseType}
                isCollapsible={collapsiblePhases.includes(phaseType)}
                isFacilitatorPhase={phaseType === facilitatorPhaseType}
                isUnsyncedFacilitatorPhase={
                  isUnsyncedFacilitatorPhase && phaseType === facilitatorPhaseType
                }
                isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
                key={phaseType}
                phaseCount={phaseCount}
                phaseType={phaseType}
                isConfirming={confirmingPhase === phaseType}
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
                history.push('/retrospective-demo-summary')
              } else {
                history.push(`/new-summary/${meetingId}`)
              }
            }}
            phaseType='SUMMARY'
          />
        )}
      </MeetingNavList>
    </NewMeetingSidebar>
  )
}

export default createFragmentContainer(RetroMeetingSidebar, {
  meeting: graphql`
    fragment RetroMeetingSidebar_meeting on RetrospectiveMeeting {
      ...RetroSidebarPhaseListItemChildren_meeting
      ...NewMeetingSidebar_meeting
      showSidebar
      settings {
        phaseTypes
      }
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
          readyCount
        }
      }
      maxPhaseIndex
    }
  `
})
