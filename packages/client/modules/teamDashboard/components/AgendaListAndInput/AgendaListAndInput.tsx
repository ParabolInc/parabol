import {AgendaListAndInput_team} from '../../../../__generated__/AgendaListAndInput_team.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {useGotoStageId} from '../../../../hooks/useMeeting'
import AgendaInput from '../AgendaInput/AgendaInput'
import AgendaList from '../AgendaList/AgendaList'
import {meetingSidebarGutter} from '../../../../styles/meeting'

const RootStyles = styled('div')<{isMeeting: boolean | undefined; disabled: boolean}>(
  ({disabled, isMeeting}) => ({
    display: 'flex',
    flexDirection: 'column',
    paddingRight: isMeeting ? 0 : 8,
    paddingTop: isMeeting ? meetingSidebarGutter : 0,
    position: 'relative',
    width: '100%',
    minHeight: 0, // required for FF68
    cursor: disabled ? 'not-allowed' : undefined,
    filter: disabled ? 'blur(3px)' : undefined,
    pointerEvents: disabled ? 'none' : undefined,
    height: isMeeting ? '100%' : undefined // 100% is required due to the flex logo in the meeting sidebar
  })
)

interface Props {
  gotoStageId?: ReturnType<typeof useGotoStageId>
  isDisabled?: boolean
  team: AgendaListAndInput_team
  isMeeting?: boolean
}

const AgendaListAndInput = (props: Props) => {
  const {gotoStageId, isDisabled, team, isMeeting} = props
  return (
    <RootStyles disabled={!!isDisabled} isMeeting={isMeeting}>
      <AgendaList gotoStageId={gotoStageId} team={team} />
      <AgendaInput disabled={!!isDisabled} team={team} />
    </RootStyles>
  )
}

export default createFragmentContainer(AgendaListAndInput, {
  team: graphql`
    fragment AgendaListAndInput_team on Team {
      ...AgendaInput_team
      ...AgendaList_team
      agendaItems {
        id
        content
        teamMember {
          id
        }
      }
      newMeeting {
        id
      }
    }
  `
})
