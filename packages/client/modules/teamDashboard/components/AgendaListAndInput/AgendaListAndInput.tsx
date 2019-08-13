import {AgendaListAndInput_team} from '../../../../__generated__/AgendaListAndInput_team.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {useGotoStageId} from '../../../../hooks/useMeeting'
import AgendaInput from '../AgendaInput/AgendaInput'
import AgendaList from '../AgendaList/AgendaList'
import {meetingSidebarGutter} from '../../../../styles/meeting'

const RootStyles = styled('div')<{disabled: boolean}>(
  ({disabled}) => ({
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    width: '100%',
    cursor: disabled ? 'not-allowed' : undefined,
    filter: disabled ? 'blur(3px)' : undefined,
    pointerEvents: disabled ? 'none' : undefined
  })
)

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId> | undefined
  isDisabled?: boolean
  team: AgendaListAndInput_team
}

const AgendaListAndInput = (props: Props) => {
  const {gotoStageId, isDisabled, team, isMeeting} = props
  return (
    <RootStyles disabled={!!isDisabled}>
      <AgendaInput disabled={!!isDisabled} team={team} />
      <AgendaList gotoStageId={gotoStageId} team={team} />
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
