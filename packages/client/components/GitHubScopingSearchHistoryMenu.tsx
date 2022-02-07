import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import PersistGitHubSearchQueryMutation from '../mutations/PersistGitHubSearchQueryMutation'
import SearchQueryId from '../shared/gqlIds/SearchQueryId'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import {GitHubScopingSearchHistoryMenu_teamMember$key} from '../__generated__/GitHubScopingSearchHistoryMenu_teamMember.graphql'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import IconButton from './IconButton'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'

const QueryString = styled('span')({
  color: PALETTE.SLATE_600,
  whiteSpace: 'normal',
  width: '100%'
})

const StyledMenuItemLabel = styled(MenuItemLabel)({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center'
})

const StyledMenuItemContent = styled('div')({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  width: '100%'
})

const DeleteIconButton = styled(IconButton)({
  fontSize: ICON_SIZE.MD18,
  transition: 'opacity .1s ease-in',
  margin: 4
})

interface Props {
  menuProps: MenuProps
  teamMemberRef: GitHubScopingSearchHistoryMenu_teamMember$key
  meetingId: string
}

const GitHubScopingSearchHistoryMenu = (props: Props) => {
  const {menuProps, meetingId, teamMemberRef} = props
  const teamMember = useFragment(
    graphql`
      fragment GitHubScopingSearchHistoryMenu_teamMember on TeamMember {
        teamId
        integrations {
          github {
            githubSearchQueries {
              id
              queryString
            }
          }
        }
      }
    `,
    teamMemberRef
  )
  const {integrations, teamId} = teamMember
  const {github} = integrations
  const {githubSearchQueries} = github!
  const atmosphere = useAtmosphere()
  const {portalStatus, isDropdown, closePortal} = menuProps
  const removeSearchQuery = (searchQuery: {queryString: string}) => {
    const {queryString} = searchQuery
    const normalizedQueryString = queryString.toLowerCase().trim()
    PersistGitHubSearchQueryMutation(atmosphere, {
      teamId,
      queryString: normalizedQueryString,
      isRemove: true
    })
  }
  return (
    <Menu
      keepParentFocus
      ariaLabel={'Select a GitHub search query'}
      portalStatus={portalStatus}
      isDropdown={isDropdown}
      closePortal={closePortal}
    >
      {githubSearchQueries.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          No saved queries yet!
        </EmptyDropdownMenuItemLabel>
      )}
      {githubSearchQueries.map((githubSearchQuery) => {
        const {id: queryId, queryString} = githubSearchQuery
        const selectQuery = () => {
          commitLocalUpdate(atmosphere, (store) => {
            const searchQueryId = SearchQueryId.join('github', meetingId)
            const githubSearchQuery = store.get(searchQueryId)!
            githubSearchQuery.setValue(queryString, 'queryString')
          })
        }
        const handleRemoveQuery = (event: React.MouseEvent) => {
          if (githubSearchQueries.length > 1) {
            event.stopPropagation() // prevents closing the menu when remove button is clicked
          }
          removeSearchQuery(githubSearchQuery)
        }
        return (
          <MenuItem
            key={queryId}
            label={
              <StyledMenuItemLabel>
                <StyledMenuItemContent>
                  <QueryString>{queryString}</QueryString>
                </StyledMenuItemContent>
                <DeleteIconButton
                  aria-label={'Remove this Search Query'}
                  icon='cancel'
                  onClick={handleRemoveQuery}
                  palette='midGray'
                />
              </StyledMenuItemLabel>
            }
            onClick={selectQuery}
          />
        )
      })}
    </Menu>
  )
}

export default GitHubScopingSearchHistoryMenu
