import graphql from 'babel-plugin-relay/macro'
import {Suspense, useState} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Groups as GroupsIcon} from '~/ui/icons'
import type {TeamFilterQuery} from '../../__generated__/TeamFilterQuery.graphql'
import query from '../../__generated__/TeamFilterQuery.graphql'
import TeamPickerMenuContent from '../../components/TeamPicker/TeamPickerMenuContent'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {Button} from '../../ui/Button/Button'
import {Menu} from '../../ui/Menu/Menu'
import {ClearFilterIcon} from './ClearFilterIcon'

const teamFilterQuery = graphql`
  query TeamFilterQuery {
    viewer {
      teams {
        ...TeamPickerMenuContent_teams
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
    // the search dialog locks scrolling outside its DOM; a modal menu installs its own lock so the list can scroll
    <Menu
      modal
      open={open}
      onOpenChange={onOpenChange}
      trigger={
        <Button
          variant='flat'
          data-dirty={teamIds.length > 0 ? '' : undefined}
          className='group items-center justify-center rounded-xl p-1 px-2 text-fg-secondary text-sm hover:bg-surface-hover data-dirty:text-fg-primary'
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
      <TeamPickerMenuContent
        isMultiple
        teamsRef={teams}
        selectedTeamIds={teamIds}
        onSelectTeam={toggleSelectedTeamId}
      >
        {teamIds.length > 0 && (
          <div className='flex justify-end px-2 pt-1'>
            <Button className='p-1 font-semibold text-xs' onClick={() => setTeamIds([])}>
              Clear
            </Button>
          </div>
        )}
      </TeamPickerMenuContent>
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
        <Button variant='flat' className='text-fg-muted'>
          <GroupsIcon />
        </Button>
      }
    >
      {queryRef && <TeamFilterContent {...props} queryRef={queryRef} />}
    </Suspense>
  )
}
