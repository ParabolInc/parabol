import {AgendaItem_agendaItem} from '../../../../__generated__/AgendaItem_agendaItem.graphql'
import React, {useEffect, useRef} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Avatar from '../../../../components/Avatar/Avatar'
import IconButton from '../../../../components/IconButton'
import MeetingSubnavItem from '../../../../components/MeetingSubnavItem'
import {useGotoStageId} from '../../../../hooks/useMeeting'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import RemoveAgendaItemMutation from '../../../../mutations/RemoveAgendaItemMutation'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import {meetingSidebarGutter} from '../../../../styles/meeting'
import {requestIdleCallback} from '../../../../utils/requestIdleCallback'
import UNSTARTED_MEETING from '../../../../utils/meetings/unstartedMeeting'
import findStageById from '../../../../utils/meetings/findStageById'
import {AgendaItem_newMeeting} from '../../../../__generated__/AgendaItem_newMeeting.graphql'

const DeleteIconButton = styled(IconButton)<{agendaLength: number; disabled?: boolean}>(
  ({agendaLength, disabled}) => ({
    display: 'block',
    // we can make the position of the del (x) more centered when there’s a low number of agenda items
    left: agendaLength < 10 ? '.8125rem' : meetingSidebarGutter,
    lineHeight: ICON_SIZE.MD18,
    opacity: 0,
    position: 'absolute',
    top: '.6875rem',
    transition: 'opacity .1s ease-in',
    visibility: disabled ? 'hidden' : undefined
  })
)

const AvatarBlock = styled('div')({
  width: '2rem'
})

const AgendaItemStyles = styled('div')(({}) => ({
  position: 'relative',
  // show the DeleteIconButton on hover
  '&:hover > button': {
    opacity: 1
  }
}))

interface Props {
  agendaItem: AgendaItem_agendaItem
  agendaLength: number
  gotoStageId: ReturnType<typeof useGotoStageId> | undefined
  idx: number
  isDragging: boolean
  newMeeting: AgendaItem_newMeeting | null
}

const AgendaItem = (props: Props) => {
  const {agendaItem, agendaLength, gotoStageId, isDragging, idx, newMeeting} = props
  const {facilitatorUserId, facilitatorStageId, phases, localStage} =
    newMeeting || UNSTARTED_MEETING
  const localStageId = (localStage && localStage.id) || ''
  const {id: agendaItemId, content, teamMember} = agendaItem
  const agendaItemStageRes = findStageById(phases, agendaItemId, 'agendaItemId')
  const agendaItemStage = agendaItemStageRes ? agendaItemStageRes.stage : null
  const {isComplete, isNavigable, isNavigableByFacilitator, id: stageId} = agendaItemStage || {
    isComplete: false,
    isNavigable: false,
    isNavigableByFacilitator: false,
    id: null
  }
  const isLocalStage = localStageId === stageId
  const isFacilitatorStage = facilitatorStageId === stageId
  const {picture} = teamMember
  const isUnsyncedFacilitatorStage = isFacilitatorStage !== isLocalStage
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (isFacilitatorStage) {
      requestIdleCallback(() => {
        ref.current && ref.current.scrollIntoView({behavior: 'smooth'})
      })
    }
  }, [isFacilitatorStage])

  useEffect(() => {
    ref.current && ref.current.scrollIntoView({behavior: 'smooth'})
  }, [])

  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const isViewerFacilitator = viewerId === facilitatorUserId

  const handleRemove = () => {
    RemoveAgendaItemMutation(atmosphere, {agendaItemId})
  }
  return (
    <AgendaItemStyles title={content}>
      <MeetingSubnavItem
        label={content}
        metaContent={
          <AvatarBlock>
            <Avatar hasBadge={false} picture={picture} size={24} />
          </AvatarBlock>
        }
        isDisabled={isViewerFacilitator ? !isNavigableByFacilitator : !isNavigable}
        onClick={gotoStageId && agendaItemStage ? () => gotoStageId(stageId) : undefined}
        orderLabel={`${idx + 1}.`}
        isActive={isLocalStage}
        isComplete={isComplete}
        isDragging={isDragging}
        isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
      />
      <DeleteIconButton
        aria-label={'Remove this agenda topic'}
        agendaLength={agendaLength}
        icon='cancel'
        onClick={handleRemove}
        palette='warm'
      />
    </AgendaItemStyles>
  )
}

export default createFragmentContainer(AgendaItem, {
  newMeeting: graphql`
    fragment AgendaItem_newMeeting on NewMeeting {
      facilitatorStageId
      facilitatorUserId
      localStage {
        id
      }
      phases {
        stages {
          ... on AgendaItemsStage {
            id
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
      teamMember {
        picture
      }
    }
  `
})
