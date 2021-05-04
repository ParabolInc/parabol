import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import Atmosphere from '../Atmosphere'
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
import TaskFooterIntegrateMenuSearch from './TaskFooterIntegrateMenuSearch'

const SearchIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD18
})

const StyledMenu = styled(Menu)({
  minWidth: 450,
  display: 'flex',
  flexDirection: 'column'
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

const setSearch = (atmosphere: Atmosphere, meetingId: string, value: string) => {
  commitLocalUpdate(atmosphere, (store) => {
    const meeting = store.get(meetingId)
    if (!meeting) return
    const githubSearchQuery = meeting.getLinkedRecord('githubSearchQuery')!
    githubSearchQuery.setValue(value, 'reposQuery')
  })
}

const GitHubScopingSearchFilterMenu = (props: Props) => {
  const {menuProps, viewer} = props
  const isLoading = viewer === null
  const atmosphere = useAtmosphere()
  const edges = viewer?.teamMember?.integrations?.github?.api?.query?.search.edges ?? []
  const meeting = viewer?.meeting ?? null
  const meetingId = meeting?.id ?? ''
  const githubSearchQuery = meeting?.githubSearchQuery ?? null
  const nameWithOwnerFilters = githubSearchQuery?.nameWithOwnerFilters ?? []
  const reposQuery = githubSearchQuery?.reposQuery ?? ''

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    setSearch(atmosphere, meetingId, value)
  }

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
        <TaskFooterIntegrateMenuSearch
          placeholder={'Search your GitHub repos'}
          value={reposQuery}
          onChange={onChange}
        />
      </SearchItem>
      {isLoading && <MockFieldList />}
      {edges.length === 0 && !isLoading && <NoResults key='no-results'>No repos found!</NoResults>}
      {edges.map((repo) => {
        const {id: repoId, nameWithOwner} = repo?.node as Pick<
          IXGitHubRepository,
          'id' | 'nameWithOwner'
        >
        const isSelected = nameWithOwnerFilters.includes(nameWithOwner)
        const handleClick = () => {
          commitLocalUpdate(atmosphere, (store) => {
            const searchQueryId = SearchQueryId.join('github', meetingId)
            const githubSearchQuery = store.get<GitHubSearchQuery>(searchQueryId)!
            const nameWithOwnerFilters = githubSearchQuery.getValue('nameWithOwnerFilters')
            const newFilters = isSelected
              ? nameWithOwnerFilters.filter((name) => name !== nameWithOwner)
              : nameWithOwnerFilters.concat(nameWithOwner)
            githubSearchQuery.setValue(newFilters, 'nameWithOwnerFilters')
            const queryString = githubSearchQuery.getValue('queryString') as string
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
                {nameWithOwner}
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
            reposQuery
          }
        }
      }
      teamMember(teamId: $teamId) {
        integrations {
          github {
            api {
              errors {
                message
                locations {
                  line
                  column
                }
                path
              }
              query {
                search(first: 50, type: REPOSITORY, query: "Parabol") {
                  edges {
                    node {
                      ... on _xGitHubRepository {
                        __typename
                        id
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
