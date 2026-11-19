import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {GitHubRepoSearchFilterMenuQuery} from '../__generated__/GitHubRepoSearchFilterMenuQuery.graphql'
import useGetRepoContributions from '../hooks/useGetRepoContributions'
import useSearchFilter from '../hooks/useSearchFilter'
import {MenuItem} from '../ui/Menu/MenuItem'
import {MenuSearch} from '../ui/Menu/MenuSearch'
import Checkbox from './Checkbox'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import TypeAheadLabel from './TypeAheadLabel'

const getValue = (item: {nameWithOwner?: string}) => {
  return item.nameWithOwner || 'Unknown Repo'
}

const MAX_REPOS = 10

interface Props {
  selectedRepos: string[]
  onToggleRepo: (repoName: string, isSelected: boolean) => void
  queryRef: PreloadedQuery<GitHubRepoSearchFilterMenuQuery>
  menuLabel?: string
}

const GitHubRepoSearchFilterMenu = (props: Props) => {
  const {queryRef, selectedRepos, onToggleRepo, menuLabel} = props
  const data = usePreloadedQuery<GitHubRepoSearchFilterMenuQuery>(
    graphql`
      query GitHubRepoSearchFilterMenuQuery($teamId: ID!) {
        viewer {
          teamMember(teamId: $teamId) {
            ...useGetRepoContributions_teamMember
          }
        }
      }
    `,
    queryRef
  )

  const repoContributions = useGetRepoContributions(data.viewer.teamMember ?? null)

  const {
    query: searchQuery,
    filteredItems: filteredRepoContributions,
    onQueryChange
  } = useSearchFilter(repoContributions, getValue)

  const selectedAndFilteredRepos = useMemo(() => {
    const adjustedMax = selectedRepos.length >= MAX_REPOS ? selectedRepos.length + 1 : MAX_REPOS
    const repos = filteredRepoContributions.map(({nameWithOwner}) =>
      nameWithOwner.toLowerCase().trim()
    )
    return Array.from(new Set([...selectedRepos, ...repos])).slice(0, adjustedMax)
  }, [filteredRepoContributions])

  return (
    <>
      {menuLabel && (
        <div className='mx-2 mb-2 font-semibold text-fg-secondary text-sm'>{menuLabel}</div>
      )}
      <MenuSearch
        placeholder='Search your GitHub repos'
        onChange={onQueryChange}
        value={searchQuery}
      />
      {repoContributions.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No repos found!</EmptyDropdownMenuItemLabel>
      )}
      {selectedAndFilteredRepos.map((repo) => {
        const isSelected = selectedRepos.includes(repo)
        return (
          <MenuItem
            key={repo}
            onSelect={(e) => e.preventDefault()}
            onClick={() => onToggleRepo(repo, isSelected)}
          >
            <Checkbox className='-ml-2 mr-2' active={isSelected} />
            <TypeAheadLabel query={searchQuery} label={repo} />
          </MenuItem>
        )
      })}
    </>
  )
}

export default GitHubRepoSearchFilterMenu
