import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import {AgendaItem_activeMeetings} from '~/__generated__/AgendaItem_activeMeetings.graphql'
import Avatar from '../../../../components/Avatar/Avatar'
import IconButton from '../../../../components/IconButton'
import MeetingSubnavItem from '../../../../components/MeetingSubnavItem'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../../hooks/useCoords'
import useGotoStageId from '../../../../hooks/useGotoStageId'
import useScrollIntoView from '../../../../hooks/useScrollIntoVIew'
import useTooltip from '../../../../hooks/useTooltip'
import RemoveAgendaItemMutation from '../../../../mutations/RemoveAgendaItemMutation'
import UpdateAgendaItemMutation from '../../../../mutations/UpdateAgendaItemMutation'
import pinIcon from '../../../../styles/theme/images/icons/pin.svg'
import unpinIcon from '../../../../styles/theme/images/icons/unpin.svg'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import {MeetingTypeEnum} from '../../../../types/graphql'
import findStageById from '../../../../utils/meetings/findStageById'
import {AgendaItem_agendaItem} from '../../../../__generated__/AgendaItem_agendaItem.graphql'

const AgendaItemStyles = styled('div')({
  position: 'relative',
  // show the DeleteIconButton on hover
  '&:hover > button': {
    opacity: 1
  }
})

const DeleteIconButton = styled(IconButton)<{disabled?: boolean}>(({disabled}) => ({
  display: 'block',
  // we can make the position of the del (x) more centered when there’s a low number of agenda items
  left: 19,
  lineHeight: ICON_SIZE.MD18,
  opacity: 0,
  position: 'absolute',
  top: '.6875rem',
  transition: 'opacity .1s ease-in',
  visibility: disabled ? 'hidden' : undefined
}))

const IconBlock = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  marginRight: '4px',
  width: '2rem',
  '&:active': {
    opacity: 0.7
  },
  '&:hover': {
    cursor: 'pointer'
  }
})

const SvgIcon = styled('img')({
  opacity: 0.7
})

const getItemProps = (
  activeMeetings: AgendaItem_activeMeetings,
  agendaItemId: string,
  viewerId: string,
  gotoStageId: ReturnType<typeof useGotoStageId> | undefined
) => {
  const fallback = {
    isDisabled: false,
    isFacilitatorStage: false,
    onClick: undefined,
    isActive: false,
    isComplete: false,
    isUnsyncedFacilitatorStage: false
  }
  const actionMeeting = activeMeetings.find(
    (activeMeeting) => activeMeeting.meetingType === MeetingTypeEnum.action
  )
  if (!actionMeeting) {
    return fallback
  }
  const {facilitatorUserId, facilitatorStageId, phases, localStage} = actionMeeting
  const localStageId = (localStage && localStage.id) || ''
  const agendaItemStageRes = findStageById(phases, agendaItemId, 'agendaItemId')
  const agendaItemStage = agendaItemStageRes?.stage
  if (!agendaItemStage) return fallback
  const {isComplete, isNavigable, isNavigableByFacilitator, id: stageId} = agendaItemStage
  const isLocalStage = localStageId === stageId
  const isFacilitatorStage = facilitatorStageId === stageId
  const isUnsyncedFacilitatorStage = isFacilitatorStage !== isLocalStage && !isLocalStage
  const isViewerFacilitator = viewerId === facilitatorUserId
  const isDisabled = isViewerFacilitator ? !isNavigableByFacilitator : !isNavigable
  const onClick = () => gotoStageId!(stageId)

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
  activeMeetings: AgendaItem_activeMeetings
  agendaItem: AgendaItem_agendaItem
  gotoStageId: ReturnType<typeof useGotoStageId> | undefined
  isDragging: boolean
  meetingId?: string | null
}

const AgendaItem = (props: Props) => {
  const {activeMeetings, agendaItem, gotoStageId, isDragging, meetingId} = props
  const {id: agendaItemId, content, pinned, teamMember} = agendaItem
  const {picture} = teamMember
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const ref = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
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
  } = getItemProps(activeMeetings, agendaItemId, viewerId, gotoStageId)
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
    RemoveAgendaItemMutation(atmosphere, {agendaItemId})
  }

  const getIcon = () => {
    if (pinned && isHovering) return <SvgIcon alt='unpinIcon' src={unpinIcon} />
    else if (!pinned && !isHovering) return <Avatar hasBadge={false} picture={picture} size={24} />
    else return <SvgIcon alt='pinnedIcon' src={pinIcon} />
  }

  return (
    <>
      <AgendaItemStyles
        onMouseOver={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <MeetingSubnavItem
          label={content}
          metaContent={
            <IconBlock
              onClick={handleIconClick}
              onMouseEnter={openTooltip}
              onMouseLeave={closeTooltip}
              ref={originRef}
            >
              {getIcon()}
            </IconBlock>
          }
          isDisabled={isDisabled}
          onClick={onClick}
          isActive={isActive}
          isComplete={isComplete}
          isDragging={isDragging}
          isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
        />
        <DeleteIconButton
          aria-label={'Remove this agenda topic'}
          icon='cancel'
          onClick={handleRemove}
          palette='midGray'
        />
      </AgendaItemStyles>
      {tooltipPortal(
        pinned ? `Unpin "${content}" from every check-in` : `Pin "${content}" to every check-in`
      )}
    </>
  )
}

export default createFragmentContainer(AgendaItem, {
  activeMeetings: graphql`
    fragment AgendaItem_activeMeetings on NewMeeting @relay(plural: true) {
      facilitatorStageId
      facilitatorUserId
      meetingType
      localStage {
        id
      }
      phases {
        stages {
          id
          ... on AgendaItemsStage {
            agendaItemId
            isComplete
            isNavigable
            isNavigableByFacilitator
          }
        }
      }
    }
  `,
  agendaItem: graphql`
    fragment AgendaItem_agendaItem on AgendaItem {
      id
      content
      pinned
      teamMember {
        picture
      }
    }
  `
})
