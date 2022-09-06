import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {ReactElement} from 'react'
import {createFragmentContainer} from 'react-relay'
import useGotoStageId from '~/hooks/useGotoStageId'
import {AddAgendaItems_meeting} from '~/__generated__/AddAgendaItems_meeting.graphql'
import useModal from '../hooks/useModal'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import findStageAfterId from '../utils/meetings/findStageAfterId'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import AddAgendaItemModal from './AddAgendaItemModal'
import Icon from './Icon'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'

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

const StyledIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  display: 'block',
  margin: '0 auto 4px',
  width: ICON_SIZE.MD24
})

interface Props {
  avatarGroup: ReactElement
  meeting: AddAgendaItems_meeting
  toggleSidebar: () => void
  gotoStageId?: ReturnType<typeof useGotoStageId>
}

const AddAgendaItems = (props: Props) => {
  const {avatarGroup, meeting, toggleSidebar} = props
  const {endedAt, showSidebar, localStage, phases, teamId} = meeting
  const {id: localStageId} = localStage
  const nextStageRes = findStageAfterId(phases, localStageId)
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
          <button onClick={openPortal}>Add agenda items</button>
          {modalPortal(<AddAgendaItemModal teamId={teamId} onCloseModal={closePortal} />)}
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
}

export default createFragmentContainer(AddAgendaItems, {
  meeting: graphql`
    fragment AddAgendaItems_meeting on NewMeeting {
      endedAt
      showSidebar
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
