import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {ReactElement} from 'react'
import {createFragmentContainer} from 'react-relay'
import useGotoStageId from '~/hooks/useGotoStageId'
import {AddAgendaItems_meeting} from '~/__generated__/AddAgendaItems_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useModal from '../hooks/useModal'
import useMutationProps from '../hooks/useMutationProps'
import AddAgendaItemMutation from '../mutations/AddAgendaItemMutation'
import RemoveAgendaItemMutation from '../mutations/RemoveAgendaItemMutation'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import {Card, DiscussionThreadEnum} from '../types/constEnums'
import findStageAfterId from '../utils/meetings/findStageAfterId'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import toTeamMemberId from '../utils/relay/toTeamMemberId'
import AddAgendaItemModal from './AddAgendaItemModal'
import Avatar from './Avatar/Avatar'
import FlatPrimaryButton from './FlatPrimaryButton'
import Icon from './Icon'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'
import PlainButton from './PlainButton/PlainButton'
import PromptResponseEditor from './promptResponse/PromptResponseEditor'

const CheckIn = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  minHeight: 98,
  padding: 16,
  width: '100%'
})

const Hint = styled('div')({
  marginTop: 16
})

const AddAgendaItemButton = styled(FlatPrimaryButton)({
  marginTop: '16px'
})

const AgendaWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  height: 'calc(100% - 72px)',
  width: '100%',
  gap: '16px',
  marginBottom: '72px'
})

const AgendaList = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '50%',
  alignItems: 'center',
  overflow: 'scroll'
})

const StyledIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  display: 'block',
  margin: '0 auto 4px',
  width: ICON_SIZE.MD24
})

const OverflowWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  minHeight: 'min-content'
})

interface Props {
  avatarGroup: ReactElement
  meeting: AddAgendaItems_meeting
  toggleSidebar: () => void
  gotoStageId?: ReturnType<typeof useGotoStageId>
}

const DescriptionButtonWrapper = styled(PlainButton)(({isClickable}: {isClickable?: boolean}) => ({
  marginTop: '16px',
  width: DiscussionThreadEnum.WIDTH,
  background: Card.BACKGROUND_COLOR,
  borderRadius: Card.BORDER_RADIUS,
  boxShadow: Elevation.CARD_SHADOW,
  padding: Card.PADDING,
  outline: 'none',
  overflow: 'scroll',
  '&:hover': {
    outline: isClickable ? `2px solid ${PALETTE.SKY_300}` : 'none'
  }
}))

const ItemHeader = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '10px',
  fontSize: '20px',
  paddingTop: '8px',
  paddingBottom: '8px',
  marginBottom: '8px',
  borderBottom: '1px solid #E0DDEC'
})
const StyledCloseButton = styled(PlainButton)({
  height: 24,
  marginLeft: 'auto'
})

const CloseIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  fontSize: ICON_SIZE.MD24,
  '&:hover': {
    opacity: 0.5
  }
})

const AddAgendaItems = (props: Props) => {
  const {avatarGroup, meeting, toggleSidebar} = props
  const {
    endedAt,
    showSidebar,
    localStage,
    phases,
    teamId,
    agendaItems,
    lastMeeting,
    id: meetingId
  } = meeting
  const {id: localStageId} = localStage
  const nextStageRes = findStageAfterId(phases, localStageId)
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()

  const handleRemove = (agendaItemId) => {
    RemoveAgendaItemMutation(atmosphere, {agendaItemId}, {meetingId})
  }

  const addExistingAgendaItem = (item) => {
    if (submitting) return
    submitMutation()
    const newAgendaItem = {
      content: `Copied: ${item.content}`,
      descriptionContent: item.descriptionContent,
      pinned: false,
      sortOrder: agendaItems.length + 1,
      teamId,
      teamMemberId: toTeamMemberId(teamId, atmosphere.viewerId)
    }
    AddAgendaItemMutation(atmosphere, {newAgendaItem}, {onError, onCompleted})
  }

  const {openPortal, closePortal, modalPortal} = useModal()
  // in case the checkin is the last phase of the meeting
  if (!nextStageRes) return null
  return (
    <MeetingContent>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.checkin}</PhaseHeaderTitle>
        </MeetingTopBar>
        <PhaseWrapper>
          <AgendaWrapper>
            <AgendaList>
              <h2>This meeting's agenda</h2>
              <OverflowWrapper>
                {agendaItems
                  .filter((item) => item.isActive)
                  .map((item) => {
                    const contentJSON = item?.descriptionContent
                      ? JSON.parse(item.descriptionContent)
                      : null

                    return (
                      <DescriptionButtonWrapper key={item.id}>
                        <ItemHeader>
                          <Avatar picture={item.teamMember.picture} size={48} />
                          {item.content}

                          <StyledCloseButton onClick={() => handleRemove(item.id)}>
                            <CloseIcon>close</CloseIcon>
                          </StyledCloseButton>
                        </ItemHeader>
                        <PromptResponseEditor content={contentJSON} readOnly={true} />
                      </DescriptionButtonWrapper>
                    )
                  })}
              </OverflowWrapper>
              <AddAgendaItemButton onClick={openPortal}>Add agenda items</AddAgendaItemButton>
            </AgendaList>
            {lastMeeting?.agendaItems && (
              <AgendaList>
                <h2>Last meetings's agenda</h2>
                Click an agenda item from last meeting to copy it to this one
                <OverflowWrapper>
                  {lastMeeting?.agendaItems &&
                    lastMeeting.agendaItems.map((item) => {
                      const contentJSON = item?.descriptionContent
                        ? JSON.parse(item.descriptionContent)
                        : null

                      return (
                        <DescriptionButtonWrapper
                          isClickable={true}
                          onClick={() => addExistingAgendaItem(item)}
                          key={item.id}
                        >
                          <ItemHeader>
                            <Avatar picture={item.teamMember.picture} size={48} />
                            {item.content}
                          </ItemHeader>
                          <PromptResponseEditor content={contentJSON} readOnly={true} />
                        </DescriptionButtonWrapper>
                      )
                    })}
                </OverflowWrapper>
              </AgendaList>
            )}
          </AgendaWrapper>
          {modalPortal(<AddAgendaItemModal teamId={teamId} onCloseModal={closePortal} />)}
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
}

export default createFragmentContainer(AddAgendaItems, {
  meeting: graphql`
    fragment AddAgendaItems_meeting on ActionMeeting {
      id
      endedAt
      showSidebar
      agendaItems {
        id
        isActive
        content
        descriptionContent
        teamMember {
          picture
          preferredName
        }
      }
      lastMeeting {
        ... on ActionMeeting {
          tasks {
            id
            ...NullableTask_task
          }
          agendaItems {
            id
            isActive
            content
            descriptionContent
            teamMember {
              picture
              preferredName
            }
          }
        }
      }
      facilitatorStageId
      localStage {
        id
      }
      phases {
        stages {
          id
        }
      }
      teamId
    }
  `
})
