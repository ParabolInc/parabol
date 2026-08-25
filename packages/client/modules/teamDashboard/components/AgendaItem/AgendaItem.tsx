import graphql from 'babel-plugin-relay/macro'
import type * as React from 'react'
import {useEffect, useRef} from 'react'
import {useFragment} from 'react-relay'
import type {
  AgendaItem_meeting$data,
  AgendaItem_meeting$key
} from '~/__generated__/AgendaItem_meeting.graphql'
import type {AgendaItem_agendaItem$key} from '../../../../__generated__/AgendaItem_agendaItem.graphql'
import Avatar from '../../../../components/Avatar/Avatar'
import IconButton from '../../../../components/IconButton'
import MeetingSubnavItem from '../../../../components/MeetingSubnavItem'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../../hooks/useCoords'
import type useGotoStageId from '../../../../hooks/useGotoStageId'
import useScrollIntoView from '../../../../hooks/useScrollIntoVIew'
import useTooltip from '../../../../hooks/useTooltip'
import RemoveAgendaItemMutation from '../../../../mutations/RemoveAgendaItemMutation'
import UpdateAgendaItemMutation from '../../../../mutations/UpdateAgendaItemMutation'
import pinIcon from '../../../../styles/theme/images/icons/pin.svg'
import unpinIcon from '../../../../styles/theme/images/icons/unpin.svg'
import {cn} from '../../../../ui/cn'
import findStageAfterId from '../../../../utils/meetings/findStageAfterId'

const getItemProps = (
  agendaItemId: string,
  viewerId: string,
  gotoStageId: ReturnType<typeof useGotoStageId> | undefined,
  meeting: AgendaItem_meeting$data | null | undefined
) => {
  const fallback = {
    isDisabled: false,
    isFacilitatorStage: false,
    onClick: undefined,
    isActive: false,
    isComplete: false,
    isUnsyncedFacilitatorStage: false
  }
  if (!meeting) return fallback
  const {facilitatorUserId, facilitatorStageId, localStage, localPhase, phases} = meeting
  const agendaItemsPhase = phases.find((phase) => phase.phaseType === 'agendaitems')!
  const localStageId = (localStage && localStage.id) || ''
  const {phaseType} = localPhase
  const {stages} = (phaseType === 'agendaitems' ? localPhase : agendaItemsPhase) ?? {}
  if (!stages) return fallback
  const agendaItemStage = stages.find((stage) => stage.agendaItem?.id === agendaItemId)
  if (!agendaItemStage) return fallback
  const {isComplete, isNavigable, isNavigableByFacilitator, id: stageId} = agendaItemStage
  const isLocalStage = localStageId === stageId
  const isFacilitatorStage = facilitatorStageId === stageId
  const isUnsyncedFacilitatorStage = isFacilitatorStage !== isLocalStage && !isLocalStage
  const isViewerFacilitator = viewerId === facilitatorUserId
  const isDisabled = isViewerFacilitator ? !isNavigableByFacilitator : !isNavigable
  const onClick = () => {
    gotoStageId!(stageId)
  }

  return {
    isUnsyncedFacilitatorStage,
    isComplete: !!isComplete,
    isDisabled,
    isFacilitatorStage,
    onClick,
    isActive: isLocalStage
  }
}

interface Props {
  agendaItem: AgendaItem_agendaItem$key
  gotoStageId: ReturnType<typeof useGotoStageId> | undefined
  isDragging: boolean
  meeting: AgendaItem_meeting$key | null | undefined
}

const AgendaItem = (props: Props) => {
  const {agendaItem: agendaItemRef, gotoStageId, isDragging, meeting: meetingRef} = props
  const agendaItem = useFragment(
    graphql`
      fragment AgendaItem_agendaItem on AgendaItem {
        id
        content
        pinned
        teamMember {
          user {
            picture
          }
        }
      }
    `,
    agendaItemRef
  )
  const meeting = useFragment(
    graphql`
      fragment AgendaItem_meeting on ActionMeeting {
        id
        endedAt
        facilitatorStageId
        facilitatorUserId
        phases {
          phaseType
          stages {
            id
          }
          ...AgendaItemPhase @relay(mask: false)
        }
        localPhase {
          phaseType
          ...AgendaItemPhase @relay(mask: false)
        }
        localStage {
          id
        }
      }
    `,
    meetingRef
  )
  const {id: agendaItemId, content, pinned, teamMember} = agendaItem
  const meetingId = meeting?.id
  const endedAt = meeting?.endedAt
  const facilitatorUserId = meeting?.facilitatorUserId
  const facilitatorStageId = meeting?.facilitatorStageId
  const phases = meeting?.phases ?? null
  const {user} = teamMember
  const {picture} = user
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const ref = useRef<HTMLDivElement>(null)
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER
  )
  const {
    isDisabled,
    onClick,
    isActive,
    isComplete,
    isUnsyncedFacilitatorStage,
    isFacilitatorStage
  } = getItemProps(agendaItemId, viewerId, gotoStageId, meeting)

  useScrollIntoView(ref, isFacilitatorStage)
  useEffect(() => {
    ref.current && ref.current.scrollIntoView({behavior: 'smooth'})
  }, [])

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    UpdateAgendaItemMutation(
      atmosphere,
      {updatedAgendaItem: {id: agendaItemId, pinned: !pinned}},
      {meetingId}
    )
  }

  const handleRemove = () => {
    if (viewerId === facilitatorUserId && isFacilitatorStage) {
      // navigate to the next best stage. onward!
      const stageRes = findStageAfterId(phases as any, facilitatorStageId!)
      if (gotoStageId && stageRes) {
        gotoStageId(stageRes.stage.id)
      }
    }
    RemoveAgendaItemMutation(atmosphere, {agendaItemId}, {meetingId})
  }

  return (
    <>
      <div className='group relative'>
        <MeetingSubnavItem
          metaContent={
            <div
              onClick={handleIconClick}
              onMouseOver={openTooltip}
              onMouseOut={closeTooltip}
              ref={originRef}
              className='flex w-6 cursor-pointer justify-center active:opacity-70'
            >
              {/* Idle shows the avatar (or a pin badge when already pinned); hovering the
                  row swaps in the pin/unpin action icon — all via group-hover, no JS state */}
              {pinned ? (
                <img
                  alt='Pinned'
                  className='opacity-70 group-hover:hidden dark:invert'
                  src={pinIcon}
                />
              ) : (
                <Avatar picture={picture} className='h-6 w-6 group-hover:hidden' />
              )}
              <img
                alt={pinned ? 'Unpin' : 'Pin'}
                className='hidden opacity-70 hover:opacity-100 group-hover:block dark:invert'
                src={pinned ? unpinIcon : pinIcon}
              />
            </div>
          }
          labelClassName='pl-7'
          isDisabled={isDisabled}
          onClick={onClick}
          isActive={isActive}
          isComplete={isComplete}
          isDragging={isDragging}
          isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
        >
          {content}
        </MeetingSubnavItem>
        {/* Delete (x) sits in the left indent gutter, revealed on row hover */}
        <IconButton
          aria-label={'Remove this agenda topic'}
          className={cn(
            '-translate-y-1/2 absolute top-1/2 left-2 block opacity-0 transition-opacity duration-100 ease-in group-hover:opacity-100',
            endedAt && 'invisible'
          )}
          disabled={!!endedAt}
          icon='cancel'
          onClick={handleRemove}
          palette='midGray'
        />
      </div>
      {tooltipPortal(
        pinned
          ? `Unpin this agenda topic from every check-in`
          : `Pin this agenda topic to every check-in`
      )}
    </>
  )
}

graphql`
  fragment AgendaItemPhase on AgendaItemsPhase {
    stages {
      id
      agendaItem {
        id
      }
      isComplete
      isNavigable
      isNavigableByFacilitator
    }
  }
`

export default AgendaItem
