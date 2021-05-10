import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import SearchQueryId from '../shared/gqlIds/SearchQueryId'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import {_xGitHubRepositoryNode, IXGitHubRepository} from '../types/graphql'
import {GitHubScopingSearchFilterMenu_viewer} from '../__generated__/GitHubScopingSearchFilterMenu_viewer.graphql'
import Checkbox from './Checkbox'
import Icon from './Icon'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'
import MockFieldList from './MockFieldList'
import MenuSearch from './MenuSearch'
import useFilteredItems from '../hooks/useFilteredItems'
import useForm from '../hooks/useForm'
import TypeAheadLabel from './TypeAheadLabel'

const SearchIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD18
})

const StyledMenu = styled(Menu)({
  width: 450
})

const NoResults = styled(MenuItemLabel)({
  color: PALETTE.SLATE_600,
  justifyContent: 'center',
  paddingLeft: 8,
  paddingRight: 8,
  fontStyle: 'italic'
})

const SearchItem = styled(MenuItemLabel)({
  margin: '0 8px 8px',
  overflow: 'visible',
  padding: 0,
  position: 'relative'
})

const StyledMenuItemIcon = styled(MenuItemComponentAvatar)({
  position: 'absolute',
  left: 8,
  margin: 0,
  pointerEvents: 'none',
  top: 4
})

const StyledCheckBox = styled(Checkbox)({
  marginLeft: -8,
  marginRight: 8
})
const StyledMenuItemLabel = styled(MenuItemLabel)({})

interface Props {
  menuProps: MenuProps
  viewer: GitHubScopingSearchFilterMenu_viewer | null
  error: Error | null
}

type GitHubSearchQuery = NonNullable<
  NonNullable<GitHubScopingSearchFilterMenu_viewer['meeting']>['githubSearchQuery']
>

type Repo = Pick<IXGitHubRepository, 'id' | 'nameWithOwner'>

const MAX_REPOS = 10

const getValue = (item: {nameWithOwner?: string}) => {
  const repoName = item.nameWithOwner || 'Unknown Project'
  return repoName.toLowerCase()
}

const GitHubScopingSearchFilterMenu = (props: Props) => {
  const {menuProps, viewer} = props
  const isLoading = viewer === null
  const atmosphere = useAtmosphere()
  const edges =
    viewer?.teamMember?.integrations.github?.api?.query?.viewer?.repositoriesContributedTo?.edges ??
    []
  const repos = useMemo(
    () => edges.map((edge) => edge?.node).filter((node): node is Repo => !!node),
    [edges]
  )
  const {fields, onChange} = useForm({
    search: {
      getDefault: () => ''
    }
  })
  const {search} = fields
  const {value} = search
  const query = value.toLowerCase()
  const meeting = viewer?.meeting ?? null
  const meetingId = meeting?.id ?? ''
  const githubSearchQuery = meeting?.githubSearchQuery ?? null
  const nameWithOwnerFilters = githubSearchQuery?.nameWithOwnerFilters ?? []
  const queryFilteredRepos = useFilteredItems(query, repos, getValue)
  const selectedAndFilteredProjects = useMemo(() => {
    const selectedRepos = repos.filter((repo) => nameWithOwnerFilters.includes(repo.nameWithOwner))
    const adjustedMax = selectedRepos.length >= MAX_REPOS ? selectedRepos.length + 1 : MAX_REPOS
    return Array.from(new Set([...selectedRepos, ...queryFilteredRepos])).slice(0, adjustedMax)
  }, [queryFilteredRepos])
  const {portalStatus, isDropdown} = menuProps
  return (
    <StyledMenu
      keepParentFocus
      ariaLabel={'Define the GitHub search query'}
      portalStatus={portalStatus}
      isDropdown={isDropdown}
    >
      <SearchItem key='search'>
        <StyledMenuItemIcon>
          <SearchIcon>search</SearchIcon>
        </StyledMenuItemIcon>
        <MenuSearch placeholder={'Search your GitHub repos'} value={value} onChange={onChange} />
      </SearchItem>
      {isLoading && <MockFieldList />}
      {edges.length === 0 && !isLoading && <NoResults key='no-results'>No repos found!</NoResults>}
      {selectedAndFilteredProjects.map((repo) => {
        const {id: repoId, nameWithOwner} = repo
        const isSelected = nameWithOwnerFilters.includes(nameWithOwner)
        const handleClick = () => {
          commitLocalUpdate(atmosphere, (store) => {
            const searchQueryId = SearchQueryId.join('github', meetingId)
            const githubSearchQuery = store.get<GitHubSearchQuery>(searchQueryId)!
            const newFilters = isSelected
              ? nameWithOwnerFilters.filter((name) => name !== nameWithOwner)
              : nameWithOwnerFilters.concat(nameWithOwner)
            const queryString = githubSearchQuery.getValue('queryString')
            githubSearchQuery.setValue(newFilters, 'nameWithOwnerFilters')
            const queryWithoutRepos = queryString
              .trim()
              .split(' ')
              .filter((str) => !str.includes('repo:'))
            const newRepos = newFilters.map((name) => `repo:${name}`)
            const newQueryStr = queryWithoutRepos.concat(newRepos).join(' ')
            githubSearchQuery.setValue(newQueryStr, 'queryString')
          })
        }
        return (
          <MenuItem
            key={repoId}
            label={
              <StyledMenuItemLabel>
                <StyledCheckBox active={isSelected} />
                <TypeAheadLabel query={query} label={nameWithOwner} />
              </StyledMenuItemLabel>
            }
            onClick={handleClick}
          />
        )
      })}
    </StyledMenu>
  )
}

export default createFragmentContainer(GitHubScopingSearchFilterMenu, {
  viewer: graphql`
    fragment GitHubScopingSearchFilterMenu_viewer on User {
      meeting(meetingId: $meetingId) {
        id
        ... on PokerMeeting {
          githubSearchQuery {
            nameWithOwnerFilters
            queryString
          }
        }
      }
      teamMember(teamId: $teamId) {
        integrations {
          github {
            api {
              query {
                viewer {
                  repositoriesContributedTo(
                    first: 10
                    orderBy: {field: UPDATED_AT, direction: DESC}
                  ) {
                    edges {
                      node {
                        nameWithOwner
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `
})
