import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import EditableText from '~/components/EditableText'
import Menu from '~/components/Menu'
import MenuItem from '~/components/MenuItem'
import MenuItemHR from '~/components/MenuItemHR'
import MenuItemWithIcon from '~/components/MenuItemWithIcon'
import useMenu from '~/hooks/useMenu'
import useMutationProps from '~/hooks/useMutationProps'
import useTooltip from '~/hooks/useTooltip'
import Legitity from '~/validation/Legitity'
import {AGENDA_ITEM_MAX_CHARS, contentValidator} from '~/validation/makeAgendaItemSchema'
import {AgendaItem_meeting} from '~/__generated__/AgendaItem_meeting.graphql'
import Avatar from '../../../../components/Avatar/Avatar'
import IconButton from '../../../../components/IconButton'
import MeetingSubnavItem from '../../../../components/MeetingSubnavItem'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../../hooks/useCoords'
import useGotoStageId from '../../../../hooks/useGotoStageId'
import useScrollIntoView from '../../../../hooks/useScrollIntoVIew'
import RemoveAgendaItemMutation from '../../../../mutations/RemoveAgendaItemMutation'
import UpdateAgendaItemMutation from '../../../../mutations/UpdateAgendaItemMutation'
import pinIcon from '../../../../styles/theme/images/icons/pin.svg'
import unpinIcon from '../../../../styles/theme/images/icons/unpin.svg'
import findStageAfterId from '../../../../utils/meetings/findStageAfterId'
import {AgendaItem_agendaItem} from '../../../../__generated__/AgendaItem_agendaItem.graphql'

const AgendaItemStyles = styled('div')({
  position: 'relative'
})

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
  agendaItemId: string,
  viewerId: string,
  gotoStageId: ReturnType<typeof useGotoStageId> | undefined,
  meeting: AgendaItem_meeting | null
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
  const {stages} = phaseType === 'agendaitems' ? localPhase : agendaItemsPhase
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
  agendaItem: AgendaItem_agendaItem
  gotoStageId: ReturnType<typeof useGotoStageId> | undefined
  isDragging: boolean
  meeting: AgendaItem_meeting | null
}

const AgendaItem = (props: Props) => {
  const {agendaItem, gotoStageId, isDragging, meeting} = props
  const {id: agendaItemId, content, pinned, teamMember} = agendaItem
  const meetingId = meeting?.id
  const endedAt = meeting?.endedAt
  const facilitatorUserId = meeting?.facilitatorUserId
  const facilitatorStageId = meeting?.facilitatorStageId
  const phases = meeting?.phases ?? null
  const {picture} = teamMember
  const atmosphere = useAtmosphere()
  const {onError, error, onCompleted, submitMutation, submitting} = useMutationProps()
  const {viewerId} = atmosphere
  const ref = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const {
    tooltipPortal,
    openTooltip,
    closeTooltip,
    originRef: tooltipRef
  } = useTooltip<HTMLDivElement>(MenuPosition.UPPER_CENTER)
  const {
    togglePortal,
    originRef: menuRef,
    menuPortal,
    menuProps
  } = useMenu<HTMLDivElement>(MenuPosition.UPPER_RIGHT)
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
    if (submitting) return
    submitMutation()
    UpdateAgendaItemMutation(
      atmosphere,
      {updatedAgendaItem: {id: agendaItemId, pinned: !pinned}},
      {meetingId, onError, onCompleted}
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
    if (submitting) return
    submitMutation()
    RemoveAgendaItemMutation(atmosphere, {agendaItemId}, {meetingId, onError, onCompleted})
  }

  const getIcons = () => {
    if (endedAt) {
      if (pinned) {
        if (isHovering) return <SvgIcon alt='unpinIcon' src={unpinIcon} />
        else return <SvgIcon alt='pinnedIcon' src={pinIcon} />
      } else {
        if (isHovering) return <SvgIcon alt='pinnedIcon' src={pinIcon} />
        else return <Avatar hasBadge={false} picture={picture} size={24} />
      }
    } else {
      if (isHovering) return <IconButton icon='more_vert' />
      if (!pinned) return <Avatar hasBadge={false} picture={picture} size={24} />
      else return <SvgIcon alt='pinnedIcon' src={pinIcon} />
    }
  }

  const getMenu = () => {
    return (
      <Menu ariaLabel={'Select the action for the agenda item'} {...menuProps}>
        {pinned ? (
          <MenuItem
            key='unpin'
            label={
              <MenuItemWithIcon
                dataCy='unpin-agenda-item'
                label={'Unpin from every check-in'}
                icon={<SvgIcon alt='unpinnedIcon' src={unpinIcon} />}
              />
            }
            onClick={handleIconClick}
          />
        ) : (
          <MenuItem
            key='pin'
            label={
              <MenuItemWithIcon
                dataCy='pin-agenda-item'
                label={'Pin to every check-in'}
                icon={<SvgIcon alt='pinnedIcon' src={pinIcon} />}
              />
            }
            onClick={handleIconClick}
          />
        )}
        <MenuItem
          key='edit'
          label={
            <MenuItemWithIcon
              dataCy='edit-agenda-item'
              label={'Edit the agenda item'}
              icon={'edit'}
            />
          }
          onClick={() => setIsEditing(true)}
        />
        <MenuItemHR key='HR1' />
        <MenuItem
          key='delete'
          label={
            <MenuItemWithIcon
              dataCy='delete-agenda-item'
              label={`Delete the agenda item`}
              icon={'delete'}
            />
          }
          onClick={handleRemove}
        />
      </Menu>
    )
  }

  const validate = (value: string) => {
    const res = contentValidator(new Legitity(value))
    if (res.error) {
      onError(new Error(res.error))
    } else {
      onCompleted()
    }
    return res
  }

  const handleSubmit = (value: string) => {
    if (submitting) return
    const {error, value: content} = validate(value)
    if (error) return
    submitMutation()

    UpdateAgendaItemMutation(
      atmosphere,
      {updatedAgendaItem: {id: agendaItemId, content}},
      {meetingId, onError, onCompleted}
    )
  }

  const [isEditing, setIsEditing] = useState(false)

  return (
    <>
      <AgendaItemStyles
        onMouseOver={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <MeetingSubnavItem
          metaContent={
            <IconBlock
              ref={(ref) => {
                tooltipRef.current = ref
                menuRef.current = ref
              }}
              onClick={endedAt ? handleIconClick : togglePortal}
              onMouseOver={openTooltip}
              onMouseOut={closeTooltip}
            >
              {getIcons()}
            </IconBlock>
          }
          isDisabled={isDisabled}
          onClick={onClick}
          isActive={isActive}
          isComplete={isComplete}
          isDragging={isDragging}
          isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
        >
          {isEditing ? (
            <EditableText
              autoFocus={isEditing}
              error={error?.message}
              handleSubmit={handleSubmit}
              validate={validate}
              maxLength={AGENDA_ITEM_MAX_CHARS}
              initialValue={content}
              placeholder={''}
              hideIcon={isDisabled || !isHovering}
              disabled={isDisabled}
              onEditingChange={setIsEditing}
            />
          ) : (
            content
          )}
        </MeetingSubnavItem>
      </AgendaItemStyles>
      {tooltipPortal(
        endedAt
          ? pinned
            ? `Unpin "${content}" from every check-in`
            : `Pin "${content}" to every check-in`
          : `Select the action for "${content}"`
      )}
      {menuPortal(getMenu())}
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

export default createFragmentContainer(AgendaItem, {
  agendaItem: graphql`
    fragment AgendaItem_agendaItem on AgendaItem {
      id
      content
      pinned
      teamMember {
        picture
      }
    }
  `,
  meeting: graphql`
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
  `
})
