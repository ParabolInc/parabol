import {AgendaListAndInput_agendaItemPhase} from '__generated__/AgendaListAndInput_agendaItemPhase.graphql'
import {AgendaListAndInput_team} from '__generated__/AgendaListAndInput_team.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {useGotoStageId} from 'universal/hooks/newMeeting'
import AgendaInput from 'universal/modules/teamDashboard/components/AgendaInput/AgendaInput'
import AgendaList from 'universal/modules/teamDashboard/components/AgendaList/AgendaList'
import {meetingSidebarGutter} from 'universal/styles/meeting'

const RootStyles = styled('div')(
  ({disabled, isDashboard}: {isDashboard: boolean; disabled: boolean}) => ({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    paddingTop: isDashboard ? 0 : meetingSidebarGutter,
    position: 'relative',
    width: '100%',
    cursor: disabled ? 'not-allowed' : undefined,
    filter: disabled ? 'blur(3px)' : undefined,
    pointerEvents: disabled ? 'none' : undefined
  })
)

const Inner = styled('div')({
  bottom: 0,
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0
})

interface Props {
  agendaItemPhase: AgendaListAndInput_agendaItemPhase | null
  facilitatorStageId: string | undefined
  gotoStageId: ReturnType<typeof useGotoStageId> | undefined
  isDisabled?: boolean
  localStageId: string | undefined
  team: AgendaListAndInput_team
}

const AgendaListAndInput = (props: Props) => {
  const {agendaItemPhase, facilitatorStageId, gotoStageId, isDisabled, localStageId, team} = props
  return (
    <RootStyles isDashboard={!agendaItemPhase} disabled={!!isDisabled}>
      <AgendaList
        agendaItemPhase={agendaItemPhase}
        facilitatorStageId={facilitatorStageId}
        gotoStageId={gotoStageId}
        localStageId={localStageId}
        team={team}
      />
      <AgendaInput disabled={!!isDisabled} team={team} />
    </RootStyles>
  )
}

export default createFragmentContainer(
  AgendaListAndInput,
  graphql`
    fragment AgendaListAndInput_agendaItemPhase on AgendaItemsPhase {
      ...AgendaList_agendaItemPhase
      stages {
        id
        isComplete
        isNavigable
      }
    }
    fragment AgendaListAndInput_team on Team {
      agendaItems {
        id
        content
        teamMember {
          id
        }
      }
      ...AgendaInput_team
      ...AgendaList_team
    }
  `
)
