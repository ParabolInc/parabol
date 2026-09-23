import graphql from 'babel-plugin-relay/macro'
import type {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import {KeyboardArrowDown as KeyboardArrowDownIcon} from '~/ui/icons'
import type {TeamPicker_teams$key} from '../../__generated__/TeamPicker_teams.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import {Menu} from '../../ui/Menu/Menu'
import setPreferredTeamId from '../../utils/relay/setPreferredTeamId'
import TeamPickerAvatars from './TeamPickerAvatars'
import TeamPickerMenuContent from './TeamPickerMenuContent'
import TeamPickerShareToOrg from './TeamPickerShareToOrg'

interface SingleProps {
  isMultiple?: false
  selectedTeamId: string
  onSelectTeam: (teamId: string) => void
  // when set, the menu explains the activity is team-private instead of listing teams
  onShareToOrg?: () => void
}

interface MultipleProps {
  isMultiple: true
  selectedTeamIds: readonly string[]
  onToggleTeam: (teamId: string) => void
  restrictToOneOrg?: boolean
}

type Props = {teamsRef: TeamPicker_teams$key; header?: ReactNode} & (SingleProps | MultipleProps)

const TeamPicker = (props: Props) => {
  const {teamsRef, header} = props
  const atmosphere = useAtmosphere()
  const teams = useFragment(
    graphql`
      fragment TeamPicker_teams on Team @relay(plural: true) {
        ...TeamPickerAvatars_team
        ...TeamPickerMenuContent_teams
        id
        name
        organization {
          name
        }
      }
    `,
    teamsRef
  )
  const selectedTeamIds = props.isMultiple ? props.selectedTeamIds : [props.selectedTeamId]
  const selectedTeams = teams.filter((team) => selectedTeamIds.includes(team.id))
  const soleTeam = selectedTeams.length === 1 ? selectedTeams[0] : undefined
  const summary =
    selectedTeams.length === 0
      ? props.isMultiple
        ? 'Select teams'
        : 'Select team'
      : selectedTeams.length <= 2
        ? selectedTeams.map((team) => team.name).join(', ')
        : `${selectedTeams.length} teams`

  const handleSelectTeam = (teamId: string) => {
    if (!selectedTeamIds.includes(teamId)) setPreferredTeamId(atmosphere, teamId)
    if (props.isMultiple) props.onToggleTeam(teamId)
    else props.onSelectTeam(teamId)
  }

  const shareToOrg = !props.isMultiple && props.onShareToOrg && soleTeam
  return (
    <Menu
      trigger={
        <button
          type='button'
          className='flex h-auto w-full cursor-pointer items-center rounded-sm border-0 bg-surface-well p-2 text-left hover:bg-surface-hover'
        >
          {soleTeam && (
            <div className='p-2'>
              <TeamPickerAvatars teamRef={soleTeam} />
            </div>
          )}
          <div className='min-w-0 grow pl-2'>
            <div className='text-sm leading-4'>{props.isMultiple ? 'Teams' : 'Team'}</div>
            <div className='truncate font-semibold text-xl leading-5'>{summary}</div>
          </div>
          <KeyboardArrowDownIcon className='mr-2 shrink-0' />
        </button>
      }
    >
      {shareToOrg ? (
        <TeamPickerShareToOrg
          teamName={soleTeam.name}
          orgName={soleTeam.organization.name}
          onShareToOrg={props.onShareToOrg!}
        />
      ) : (
        <TeamPickerMenuContent
          teamsRef={teams}
          header={header}
          selectedTeamIds={selectedTeamIds}
          onSelectTeam={handleSelectTeam}
          isMultiple={!!props.isMultiple}
          restrictToOneOrg={props.isMultiple ? props.restrictToOneOrg : false}
        />
      )}
    </Menu>
  )
}

export default TeamPicker
