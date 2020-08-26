import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import {AgendaListAndInput_meeting} from '~/__generated__/AgendaListAndInput_meeting.graphql'

import styled from '@emotion/styled'

import {AgendaListAndInput_team} from '../../../../__generated__/AgendaListAndInput_team.graphql'
import useGotoStageId from '../../../../hooks/useGotoStageId'
import AgendaInput from '../AgendaInput/AgendaInput'
import AgendaList from '../AgendaList/AgendaList'
import {NewMeetingPhaseTypeEnum} from '~/types/graphql'

const RootStyles = styled('div')<{isMeeting: boolean | undefined; disabled: boolean}>(
  ({disabled, isMeeting}) => ({
    display: 'flex',
    flexDirection: 'column',
    paddingRight: isMeeting ? 0 : 8,
    paddingTop: 0,
    position: 'relative',
    width: '100%',
    minHeight: 0, // required for FF68
    cursor: disabled ? 'not-allowed' : undefined,
    filter: disabled ? 'blur(3px)' : undefined,
    pointerEvents: disabled ? 'none' : undefined,
    height: isMeeting ? '100%' : undefined // 100% is required due to the flex logo in the meeting sidebar
  })
)

const StyledAgendaInput = styled(AgendaInput)<{isMeeting: boolean | undefined}>(({isMeeting}) => ({
  paddingRight: isMeeting ? 8 : undefined
}))

interface Props {
  dashSearch?: string
  gotoStageId?: ReturnType<typeof useGotoStageId>
  isDisabled?: boolean
  meeting: AgendaListAndInput_meeting | null
  team: AgendaListAndInput_team
}

const getAgendaItems = (meeting) => {
  if (!meeting) return null
  const agendaItemsPhase = meeting.phases!.find(
    (phase) => phase.phaseType === NewMeetingPhaseTypeEnum.agendaitems
  )!
  if (!agendaItemsPhase.stages) return null
  return agendaItemsPhase.stages.map((stage) => stage.agendaItem)
}

const AgendaListAndInput = (props: Props) => {
  const {dashSearch, gotoStageId, isDisabled, team, meeting} = props
  const endedAt = meeting?.endedAt
  const agendaItems = team.agendaItems ? team.agendaItems : getAgendaItems(meeting)

  return (
    <RootStyles disabled={!!isDisabled} isMeeting={!!meeting}>
      <AgendaList
        agendaItems={agendaItems}
        dashSearch={dashSearch}
        gotoStageId={gotoStageId}
        meeting={meeting}
      />
      <StyledAgendaInput disabled={!!isDisabled || !!endedAt} isMeeting={!!meeting} team={team} />
    </RootStyles>
  )
}

graphql`
  fragment AgendaListAndInputAgendaItemPhase on NewMeetingPhase {
    id
    phaseType
    ... on AgendaItemsPhase {
      stages {
        isNavigable
        agendaItem {
          id
          content
          # need this for the DnD
          sortOrder
          ...AgendaItem_agendaItem
          ...AgendaList_agendaItems
        }
      }
    }
  }
`

export default createFragmentContainer(AgendaListAndInput, {
  team: graphql`
    fragment AgendaListAndInput_team on Team {
      ...AgendaInput_team
      agendaItems {
        id
        content
        sortOrder
        ...AgendaItem_agendaItem
      }
    }
  `,
  meeting: graphql`
    fragment AgendaListAndInput_meeting on ActionMeeting {
      ...AgendaList_meeting
      endedAt
      # load up the localPhase
      phases {
        ...AgendaListAndInputAgendaItemPhase @relay(mask: false)
      }
      localPhase {
        ...AgendaListAndInputAgendaItemPhase @relay(mask: false)
      }
    }
  `
})
