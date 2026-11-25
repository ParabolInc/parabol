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
import useGotoTeamHealthStageInRetro from '../hooks/useGotoTeamHealthStageInRetro'
import {GQLID} from '../utils/GQLID'
import getSidebarItemStage from '../utils/getSidebarItemStage'
import findStageById from '../utils/meetings/findStageById'
import getTeamHealthCheckShownInRetro from '../utils/meetings/getTeamHealthCheckShownInRetro'
import isPhaseComplete from '../utils/meetings/isPhaseComplete'
import MeetingNavList from './MeetingNavList'
import NewMeetingSidebar from './NewMeetingSidebar'
import NewMeetingSidebarPhaseListItem from './NewMeetingSidebarPhaseListItem'
import RetroSidebarPhaseListItemChildren from './RetroSidebarPhaseListItemChildren'
import RetroSidebarTeamHealthResults from './RetroTeamHealth/RetroSidebarTeamHealthResults'

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
              isNavigable
            }
          }
        }
        ...useGotoTeamHealthStageInRetro_meeting
        ...RetroSidebarTeamHealthResults_meeting
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
  const teamHealthMeeting = getTeamHealthCheckShownInRetro(meeting)
  const localPhaseType = localPhase ? localPhase.phaseType : ''
  const facilitatorStageRes = findStageById(phases, facilitatorStageId)
  const facilitatorPhaseType = facilitatorStageRes ? facilitatorStageRes.phase.phaseType : ''
  const isViewerFacilitator = facilitatorUserId === viewerId
  const isUnsyncedFacilitatorPhase = facilitatorPhaseType !== localPhaseType
  const isUnsyncedFacilitatorStage = localStage ? localStage.id !== facilitatorStageId : undefined
  const [confirmingPhase, setConfirmingPhase] = useState<NewMeetingPhaseTypeEnum | null>(null)
  const gotoCheckStage = useGotoTeamHealthStageInRetro(meeting, gotoStageId)
  // with a check, Team Health is the check's Respond row: it opens the check's intro and lists its
  // questions, and a Results row follows. The question or result the viewer is on carries the active
  // state, so Team Health is active only on the intro
  const findCheckStages = (checkPhaseType: NewMeetingPhaseTypeEnum) =>
    teamHealthMeeting?.phases.find(({phaseType}) => phaseType === checkPhaseType)?.stages
  const checkIntroStage = findCheckStages('TEAM_HEALTH_INTRO')?.[0]
  const checkQuestionStages = findCheckStages('TEAM_HEALTH_RESPONSE')
  const checkRespondStage = checkIntroStage?.isNavigable
    ? checkIntroStage
    : checkQuestionStages?.[0]
  const checkResultStageId = findCheckStages('TEAM_HEALTH_RESULT')?.[0]?.id
  const checkLocalPhaseType = teamHealthMeeting?.localPhase?.phaseType
  const isPastCheckIntro = !!checkLocalPhaseType && checkLocalPhaseType !== 'TEAM_HEALTH_INTRO'
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
          const hasCheck = phaseType === 'TEAM_HEALTH' && !!teamHealthMeeting
          const gotoPhase = () =>
            hasCheck && checkRespondStage
              ? gotoCheckStage(checkRespondStage.id)
              : gotoStageId(itemStageId)
          const handleClick =
            (rowPhaseType: NewMeetingPhaseTypeEnum, go: () => Promise<void>) => () => {
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
                confirmingPhase === rowPhaseType
              ) {
                setConfirmingPhase(null)
                go().catch(() => {
                  /*ignore*/
                })
                handleMenuClick()
              } else {
                setConfirmingPhase(rowPhaseType)
              }
            }
          const discussPhase = phases.find((phase) => {
            return phase.phaseType === 'discuss'
          })!
          const showDiscussSection = isPhaseComplete('vote', phases)
          const phaseCount =
            phaseType === 'discuss' && showDiscussSection
              ? discussPhase?.stages.length
              : hasCheck
                ? checkQuestionStages?.length
                : undefined
          return (
            <Fragment key={phaseType}>
              <NewMeetingSidebarPhaseListItem
                handleClick={canNavigate ? handleClick(phaseType, gotoPhase) : undefined}
                isActive={
                  phaseType === 'discuss' || phaseType === 'checkin' || phaseType === 'updates'
                    ? false
                    : localPhaseType === phaseType && !(hasCheck && isPastCheckIntro)
                }
                isCollapsible={collapsiblePhases.includes(phaseType) || hasCheck}
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
              {hasCheck && (
                <RetroSidebarTeamHealthResults
                  handleClick={
                    canNavigate && checkResultStageId
                      ? handleClick('TEAM_HEALTH_RESULT', () => gotoCheckStage(checkResultStageId))
                      : undefined
                  }
                  isConfirming={isViewerFacilitator && confirmingPhase === 'TEAM_HEALTH_RESULT'}
                  gotoStageId={gotoStageId}
                  handleMenuClick={handleMenuClick}
                  meeting={meeting}
                />
              )}
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
