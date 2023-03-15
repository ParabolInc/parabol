import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {
  AgendaListAndInput_meeting$key,
  AgendaListAndInput_meeting$data
} from '~/__generated__/AgendaListAndInput_meeting.graphql'
import useGotoStageId from '../../../../hooks/useGotoStageId'
import {AgendaListAndInput_team$key} from '../../../../__generated__/AgendaListAndInput_team.graphql'
import AgendaInput from '../AgendaInput/AgendaInput'
import AgendaList from '../AgendaList/AgendaList'

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
  meeting: AgendaListAndInput_meeting$key | null
  team: AgendaListAndInput_team$key
}

const getAgendaItems = (meeting: AgendaListAndInput_meeting$data | null) => {
  if (!meeting) return null
  const agendaItemsPhase = meeting.phases!.find((phase) => phase.phaseType === 'agendaitems')
  if (!agendaItemsPhase?.stages) return null
  return agendaItemsPhase.stages.map((stage) => stage.agendaItem)
}

const AgendaListAndInput = (props: Props) => {
  const {dashSearch, gotoStageId, isDisabled, team: teamRef, meeting: meetingRef} = props
  const team = useFragment(
    graphql`
      fragment AgendaListAndInput_team on Team {
        ...AgendaInput_team
        agendaItems {
          id
          content
          sortOrder
          ...AgendaList_agendaItems
        }
      }
    `,
    teamRef
  )
  const meeting = useFragment(
    graphql`
      fragment AgendaListAndInput_meeting on ActionMeeting {
        ...AgendaList_meeting
        endedAt
        phases {
          ...AgendaListAndInputAgendaItemPhase @relay(mask: false)
        }
      }
    `,
    meetingRef
  )
  const endedAt = meeting?.endedAt
  const agendaItems = getAgendaItems(meeting) || team.agendaItems

  return (
    <RootStyles disabled={!!isDisabled} isMeeting={!!meeting}>
      {agendaItems && (
        <AgendaList
          agendaItems={agendaItems}
          dashSearch={dashSearch}
          gotoStageId={gotoStageId}
          meeting={meeting}
        />
      )}
      {!endedAt && <StyledAgendaInput disabled={!!isDisabled} isMeeting={!!meeting} team={team} />}
    </RootStyles>
  )
}

graphql`
  fragment AgendaListAndInputAgendaItemPhase on NewMeetingPhase {
    phaseType
    ... on AgendaItemsPhase {
      stages {
        agendaItem {
          ...AgendaItem_agendaItem
          ...AgendaList_agendaItems
        }
      }
    }
  }
`

export default AgendaListAndInput
