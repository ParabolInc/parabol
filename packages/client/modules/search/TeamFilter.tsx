import GroupsIcon from '@mui/icons-material/Groups'
import graphql from 'babel-plugin-relay/macro'
import {Suspense, useState} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {TeamFilterQuery} from '../../__generated__/TeamFilterQuery.graphql'
import query from '../../__generated__/TeamFilterQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {Button} from '../../ui/Button/Button'
import {Menu} from '../../ui/Menu/Menu'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {MenuItemCheckbox} from '../../ui/Menu/MenuItemCheckbox'
import {ClearFilterIcon} from './ClearFilterIcon'

const teamFilterQuery = graphql`
  query TeamFilterQuery {
    viewer {
      teams {
        id
        name
      }
    }
  }
`

interface TeamFilterContentProps {
  teamIds: string[]
  setTeamIds: (ids: string[]) => void
  queryRef: PreloadedQuery<TeamFilterQuery>
}

const TeamFilterContent = ({teamIds, setTeamIds, queryRef}: TeamFilterContentProps) => {
  const data = usePreloadedQuery<TeamFilterQuery>(teamFilterQuery, queryRef)
  const {viewer} = data
  const {teams} = viewer

  const toggleSelectedTeamId = (teamId: string) => {
    const nextTeamIds = teamIds.includes(teamId)
      ? teamIds.filter((curTeamId) => curTeamId !== teamId)
      : [...teamIds, teamId]
    setTeamIds(nextTeamIds)
  }

  const label =
    teams
      .filter((team) => teamIds.includes(team.id))
      .map((team) => team.name)
      .join(', ') || 'All Teams'

  // Truncate label if it's too long
  const displayLabel = label.length > 20 ? `${label.substring(0, 18)}…` : label
  const [open, setOpen] = useState(false)
  const onOpenChange = (willOpen: boolean) => {
    setOpen(willOpen)
  }
  return (
    <Menu
      open={open}
      onOpenChange={onOpenChange}
      trigger={
        <Button
          variant='flat'
          data-dirty={teamIds.length > 0 ? '' : undefined}
          className='group items-center justify-center rounded-xl p-1 px-2 text-slate-600 text-sm hover:bg-slate-200 data-dirty:text-slate-700'
        >
          <GroupsIcon className='pr-1' />
          <span>{displayLabel}</span>
          {teamIds.length > 0 && !open && (
            <ClearFilterIcon
              onClick={() => {
                setTeamIds([])
              }}
            />
          )}
        </Button>
      }
    >
      <MenuContent
        align='start'
        sideOffset={4}
        className='z-30 h-fit max-h-96 w-auto min-w-[200px] max-w-none border border-slate-200 p-2 shadow-xl'
      >
        <div className='flex flex-col gap-1'>
          {teamIds.length > 0 && (
            <div className='flex justify-end pb-2'>
              <Button className='p-1 font-semibold text-xs' onClick={() => setTeamIds([])}>
                Clear
              </Button>
            </div>
          )}
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
        </div>
      </MenuContent>
    </Menu>
  )
}

interface Props {
  teamIds: string[]
  setTeamIds: (ids: string[]) => void
}

export const TeamFilter = (props: Props) => {
  const queryRef = useQueryLoaderNow<TeamFilterQuery>(query)

  return (
    <Suspense
      fallback={
        <Button variant='flat' className='text-slate-400'>
          <GroupsIcon />
        </Button>
      }
    >
      {queryRef && <TeamFilterContent {...props} queryRef={queryRef} />}
    </Suspense>
  )
}
