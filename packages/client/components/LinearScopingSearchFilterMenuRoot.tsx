import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {commitLocalUpdate, PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import SendClientSideEvent from '~/utils/SendClientSideEvent'
import {LinearScopingSearchFilterMenuRoot_query$key} from '../__generated__/LinearScopingSearchFilterMenuRoot_query.graphql'
import {LinearScopingSearchFilterMenuRootQuery} from '../__generated__/LinearScopingSearchFilterMenuRootQuery.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useLinearProjectsAndTeams, {
  LinearProjectOrTeam,
  Project
} from '../hooks/useLinearProjectsAndTeams'
import {MenuProps} from '../hooks/useMenu'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import LinearSelectorMenu from './LinearSelectorMenu'
import MockFieldList from './MockFieldList'

const LinearScopingSearchFilterMenuRootFragmentNode = graphql`
  fragment LinearScopingSearchFilterMenuRoot_query on Query
  @argumentDefinitions(teamId: {type: "ID!"}, meetingId: {type: "ID!"}) {
    viewer {
      meeting(meetingId: $meetingId) {
        id
        ... on PokerMeeting {
          linearSearchQuery {
            __id
            selectedProjectsIds
          }
        }
      }
      teamMember(teamId: $teamId) {
        ...useLinearProjectsAndTeams_teamMember
      }
    }
  }
`

const LinearScopingSearchFilterMenuRootQueryNode = graphql`
  query LinearScopingSearchFilterMenuRootQuery($teamId: ID!, $meetingId: ID!) {
    ...LinearScopingSearchFilterMenuRoot_query @arguments(teamId: $teamId, meetingId: $meetingId)
  }
`

const linearProjectNameWithTeam = (project: Project): string => {
  const {name: projectName, teams} = project
  const teamName = teams?.nodes?.[0]?.displayName
  return teamName ? `${teamName}/${projectName}` : projectName || 'Unknown Project'
}

const getItemLabel = (item: LinearProjectOrTeam): string => {
  if ('teams' in item && item.teams !== undefined) {
    return linearProjectNameWithTeam(item)
  }
  return item.name || 'Unknown Team'
}

const getItemId = (item: LinearProjectOrTeam): string => {
  const typeName = item.__typename ?? 'UnknownType'
  return `${typeName}:${item.id}`
}

interface Props {
  menuProps: MenuProps
  teamId: string
  meetingId: string
}

const LinearScopingSearchFilterMenuRoot = (props: Props) => {
  const {menuProps, teamId, meetingId} = props

  const queryRef = useQueryLoaderNow<LinearScopingSearchFilterMenuRootQuery>(
    LinearScopingSearchFilterMenuRootQueryNode,
    {meetingId, teamId}
  )

  return (
    <Suspense fallback={<MockFieldList />}>
      {queryRef && (
        <LinearScopingSearchFilterMenuContent
          queryRef={queryRef}
          menuProps={menuProps}
          meetingId={meetingId}
        />
      )}
    </Suspense>
  )
}

interface ContentProps {
  queryRef: PreloadedQuery<LinearScopingSearchFilterMenuRootQuery>
  menuProps: MenuProps
  meetingId: string
}

const LinearScopingSearchFilterMenuContent = ({queryRef, menuProps, meetingId}: ContentProps) => {
  const queryData = usePreloadedQuery(LinearScopingSearchFilterMenuRootQueryNode, queryRef)
  const fragmentData = useFragment<LinearScopingSearchFilterMenuRoot_query$key>(
    LinearScopingSearchFilterMenuRootFragmentNode,
    queryData
  )

  const atmosphere = useAtmosphere()
  const meeting = fragmentData.viewer?.meeting
  const linearSearchQueryStoreObject = meeting?.linearSearchQuery
  const selectedProjectsIds = linearSearchQueryStoreObject?.selectedProjectsIds ?? []

  // Convert undefined to null explicitly to satisfy TypeScript
  const teamMemberRefForHook = fragmentData.viewer?.teamMember ?? null

  // Always call the hook - now it accepts null
  const {searchQuery, setSearchQuery, filteredProjectsAndTeams} =
    useLinearProjectsAndTeams(teamMemberRefForHook)

  // Now we can check and return early if needed
  if (!teamMemberRefForHook) {
    console.error('LinearScopingSearchFilterMenu: teamMember data is missing.')
    return <MockFieldList />
  }

  const handleSelectItem = (itemId: string, isSelected: boolean) => {
    if (!linearSearchQueryStoreObject) return

    commitLocalUpdate(atmosphere, (store) => {
      const linearSearchQueryRecord = store.get(linearSearchQueryStoreObject.__id)
      if (!linearSearchQueryRecord) return

      const currentSelectedIds =
        (linearSearchQueryRecord.getValue('selectedProjectsIds') as string[] | null) ?? []

      const newSelectedProjectsIds = isSelected
        ? currentSelectedIds.filter((id) => id !== itemId)
        : [...currentSelectedIds, itemId]

      linearSearchQueryRecord.setValue(newSelectedProjectsIds, 'selectedProjectsIds')
    })

    SendClientSideEvent(atmosphere, 'Selected Poker Scope Project Filter', {
      meetingId,
      selectionValue: itemId,
      service: 'linear'
    })
  }

  return (
    <LinearSelectorMenu
      items={filteredProjectsAndTeams}
      selectedItemIds={selectedProjectsIds}
      onSelectItem={handleSelectItem}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      menuProps={menuProps}
      placeholder='Search Linear projects or teams'
      emptyStateMessage='No projects or teams found!'
      getItemId={getItemId}
      getItemLabel={getItemLabel}
    />
  )
}

export default LinearScopingSearchFilterMenuRoot
