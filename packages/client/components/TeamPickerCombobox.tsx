import type {NodeViewProps} from '@tiptap/core'
import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {TeamPickerComboboxQuery} from '../__generated__/TeamPickerComboboxQuery.graphql'
import type {InsightsBlockAttrs} from '../tiptap/extensions/insightsBlock/InsightsBlock'
import {Menu} from '../ui/Menu/Menu'
import {MenuLabelTrigger} from '../ui/Menu/MenuLabelTrigger'
import TeamPickerMenuContent from './TeamPicker/TeamPickerMenuContent'

const query = graphql`
  query TeamPickerComboboxQuery {
    viewer {
      teams {
        ...TeamPickerMenuContent_teams
        id
        name
      }
    }
  }
`

interface Props {
  updateAttributes: NodeViewProps['updateAttributes']
  attrs: InsightsBlockAttrs
  queryRef: PreloadedQuery<TeamPickerComboboxQuery>
}

export const TeamPickerCombobox = (props: Props) => {
  const {updateAttributes, queryRef, attrs} = props
  const data = usePreloadedQuery<TeamPickerComboboxQuery>(query, queryRef)
  const {viewer} = data
  const {teams} = viewer
  const {teamIds} = attrs
  const toggleSelectedTeamId = (teamId: string) => {
    const nextTeamIds = teamIds.includes(teamId)
      ? teamIds.filter((curTeamId) => curTeamId !== teamId)
      : [...teamIds, teamId]
    updateAttributes({teamIds: nextTeamIds})
  }

  const label =
    teams
      .filter((team) => teamIds.includes(team.id))
      .map((team) => team.name)
      .join(', ') || 'Select your teams...'
  return (
    <Menu trigger={<MenuLabelTrigger>{label}</MenuLabelTrigger>}>
      <TeamPickerMenuContent
        isMultiple
        align='end'
        teamsRef={teams}
        selectedTeamIds={teamIds}
        onSelectTeam={toggleSelectedTeamId}
      />
    </Menu>
  )
}
