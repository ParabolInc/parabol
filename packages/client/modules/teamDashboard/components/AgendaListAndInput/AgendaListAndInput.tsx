import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {
  AgendaListAndInput_meeting$data,
  AgendaListAndInput_meeting$key
} from '~/__generated__/AgendaListAndInput_meeting.graphql'
import type {AgendaListAndInput_team$key} from '../../../../__generated__/AgendaListAndInput_team.graphql'
import type useGotoStageId from '../../../../hooks/useGotoStageId'
import {cn} from '../../../../ui/cn'
import AgendaInput from '../AgendaInput/AgendaInput'
import AgendaList from '../AgendaList/AgendaList'

interface Props {
  dashSearch?: string
  gotoStageId?: ReturnType<typeof useGotoStageId>
  isDisabled?: boolean
  meeting: AgendaListAndInput_meeting$key | null
  team: AgendaListAndInput_team$key
}

const getAgendaItems = (meeting: AgendaListAndInput_meeting$data | null | undefined) => {
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
    <div
      className={cn(
        'relative flex min-h-0 w-full flex-col pt-0',
        meeting ? 'h-full pr-0' : 'pr-2',
        isDisabled && 'pointer-events-none cursor-not-allowed blur-[3px]'
      )}
    >
      {agendaItems && (
        <AgendaList
          agendaItems={agendaItems}
          dashSearch={dashSearch}
          gotoStageId={gotoStageId}
          meeting={meeting}
        />
      )}
      {!endedAt && (
        <AgendaInput className={meeting ? 'pr-2' : undefined} disabled={!!isDisabled} team={team} />
      )}
    </div>
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
