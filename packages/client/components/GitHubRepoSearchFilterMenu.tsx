import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import {GitHubRepoSearchFilterMenu_teamMember$key} from '../__generated__/GitHubRepoSearchFilterMenu_teamMember.graphql'
import useGetRepoContributions from '../hooks/useGetRepoContributions'
import {MenuProps} from '../hooks/useMenu'
import useSearchFilter from '../hooks/useSearchFilter'
import Checkbox from './Checkbox'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'
import {SearchMenuItem} from './SearchMenuItem'
import TypeAheadLabel from './TypeAheadLabel'

const StyledCheckBox = styled(Checkbox)({
  marginLeft: -8,
  marginRight: 8
})
const StyledMenuItemLabel = styled(MenuItemLabel)({})

const StyledMenu = styled(Menu)({
  maxWidth: '100%',
  minWidth: '300px',
  padding: '8px',
  maxHeight: '100%'
})

const getValue = (item: {nameWithOwner?: string}) => {
  return item.nameWithOwner || 'Unknown Repo'
}

const MAX_REPOS = 10

interface Props {
  selectedRepos: string[]
  onToggleRepo: (repoName: string, isSelected: boolean) => void
  teamMemberRef: GitHubRepoSearchFilterMenu_teamMember$key
  menuProps: MenuProps
  menuLabel?: string
}

const GitHubRepoSearchFilterMenu = (props: Props) => {
  const {teamMemberRef, menuProps, selectedRepos, onToggleRepo, menuLabel} = props
  const teamMember = useFragment(
    graphql`
      fragment GitHubRepoSearchFilterMenu_teamMember on TeamMember {
        ...useGetRepoContributions_teamMember
      }
    `,
    teamMemberRef
  )

  const repoContributions = useGetRepoContributions(teamMember)

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

  const {portalStatus, isDropdown} = menuProps
  return (
    <StyledMenu
      keepParentFocus
      ariaLabel='Define the GitHub search query'
      portalStatus={portalStatus}
      isDropdown={isDropdown}
    >
      {menuLabel && (
        <div className='mx-2 mb-2 text-sm font-semibold text-slate-600'>{menuLabel}</div>
      )}
      <SearchMenuItem
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
            label={
              <StyledMenuItemLabel>
                <StyledCheckBox active={isSelected} />
                <TypeAheadLabel query={searchQuery} label={repo} />
              </StyledMenuItemLabel>
            }
            onClick={() => onToggleRepo(repo, isSelected)}
          />
        )
      })}
    </StyledMenu>
  )
}

export default GitHubRepoSearchFilterMenu
