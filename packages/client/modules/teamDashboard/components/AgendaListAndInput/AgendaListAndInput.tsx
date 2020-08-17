import {AgendaListAndInput_team} from '../../../../__generated__/AgendaListAndInput_team.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import AgendaInput from '../AgendaInput/AgendaInput'
import AgendaList from '../AgendaList/AgendaList'
import useGotoStageId from '../../../../hooks/useGotoStageId'

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
  agendaItems: any
  dashSearch?: string
  gotoStageId?: ReturnType<typeof useGotoStageId>
  isDisabled?: boolean
  team: AgendaListAndInput_team
  meeting?: any
  meetingId?: string
}

const AgendaListAndInput = (props: Props) => {
  const {agendaItems, dashSearch, gotoStageId, isDisabled, team, meeting, meetingId} = props
  const endedAt = meeting?.endedAt

  return (
    <RootStyles disabled={!!isDisabled} isMeeting={!!meetingId}>
      <AgendaList
        agendaItems={agendaItems}
        dashSearch={dashSearch}
        gotoStageId={gotoStageId}
        meeting={meeting}
        meetingId={meetingId}
      />
      <StyledAgendaInput disabled={!!isDisabled || endedAt} isMeeting={!!meetingId} team={team} />
    </RootStyles>
  )
}

export default createFragmentContainer(AgendaListAndInput, {
  team: graphql`
    fragment AgendaListAndInput_team on Team {
      ...AgendaInput_team
      ...AgendaList_team
    }
  `
})
