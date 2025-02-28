import type {NodeViewProps} from '@tiptap/core'
import graphql from 'babel-plugin-relay/macro'
import {usePreloadedQuery, type PreloadedQuery} from 'react-relay'
import type {TeamPickerComboboxQuery} from '../__generated__/TeamPickerComboboxQuery.graphql'
import type {InsightsBlockAttrs} from '../tiptap/extensions/insightsBlock/InsightsBlock'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItemCheckbox} from '../ui/Menu/MenuItemCheckbox'
import {MenuLabelTrigger} from '../ui/Menu/MenuLabelTrigger'

const query = graphql`
  query TeamPickerComboboxQuery {
    viewer {
      teams {
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
      <MenuContent align='end' sideOffset={4}>
        {teams.map((team) => {
          const checked = teamIds.includes(team.id)
          return (
            <MenuItemCheckbox
              key={team.id}
              checked={checked}
              onClick={() => {
                toggleSelectedTeamId(team.id)
              }}
            >
              {team.name}
            </MenuItemCheckbox>
          )
        })}
      </MenuContent>
    </Menu>
  )
}
