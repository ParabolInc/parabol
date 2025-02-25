import {ExpandMore} from '@mui/icons-material'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type {NodeViewProps} from '@tiptap/core'
import graphql from 'babel-plugin-relay/macro'
import {usePreloadedQuery, type PreloadedQuery} from 'react-relay'
import type {TeamPickerComboboxQuery} from '../__generated__/TeamPickerComboboxQuery.graphql'
import type {InsightsBlockAttrs} from '../tiptap/extensions/imageBlock/InsightsBlock'
import {Checkbox} from '../ui/Checkbox/Checkbox'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
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
    <Menu
      className='data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up'
      trigger={
        <div className='group flex cursor-pointer items-center justify-between rounded-md bg-white'>
          <div className='p-2 leading-4'>{label}</div>
          <div className='flex items-center'>
            <ExpandMore className='text-slate-600 transition-transform group-data-[state=open]:rotate-180' />
          </div>
        </div>
      }
    >
      <MenuContent align='end' sideOffset={4}>
        <div>
          {teams.map((team) => {
            const checked = teamIds.includes(team.id)
            return (
              <DropdownMenu.Item
                key={team.id}
                asChild
                onSelect={(e) => {
                  e.preventDefault()
                }}
                onClick={() => {
                  toggleSelectedTeamId(team.id)
                }}
              >
                <div className='mx-1 flex'>
                  <div
                    data-highlighted={checked}
                    className={
                      'group flex w-full cursor-pointer items-center space-x-2 rounded-md px-3 py-2 text-sm leading-8 text-slate-700 outline-hidden hover:bg-slate-200! hover:text-slate-900 focus:bg-slate-200 data-highlighted:bg-slate-100 data-highlighted:text-slate-900'
                    }
                  >
                    <div className='flex size-7 items-center justify-center rounded-sm bg-slate-200 group-hover:bg-slate-300 group-data-highlighted:bg-slate-300'>
                      <Checkbox checked={checked} />
                    </div>
                    <div className='flex flex-col text-sm select-none'>
                      <span>{team.name}</span>
                      {/* <span className='text-xs text-slate-600'>{command.description}</span> */}
                    </div>
                  </div>
                </div>
              </DropdownMenu.Item>
            )
          })}
        </div>
      </MenuContent>
    </Menu>
  )
}
