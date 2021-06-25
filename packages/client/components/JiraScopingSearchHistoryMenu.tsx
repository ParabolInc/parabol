import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {MouseEvent} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import SearchQueryId from '../shared/gqlIds/SearchQueryId'
import {PALETTE} from '../styles/paletteV3'
import {JiraScopingSearchHistoryMenu_teamMember} from '../__generated__/JiraScopingSearchHistoryMenu_teamMember.graphql'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'
import PersistJiraSearchQueryMutation from '../mutations/PersistJiraSearchQueryMutation'
import IconButton from './IconButton'
import {ICON_SIZE} from '../styles/typographyV2'

const NoResults = styled(MenuItemLabel)({
  color: PALETTE.SLATE_600,
  justifyContent: 'center',
  paddingLeft: 8,
  paddingRight: 8,
  fontStyle: 'italic'
})

const QueryString = styled('span')({
  color: PALETTE.SLATE_600
})

const ProjectFilter = styled('span')({
  color: PALETTE.SLATE_600
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
  alignItems: 'flex-start'
})

const DeleteIconButton = styled(IconButton)({
  fontSize: ICON_SIZE.MD18,
  transition: 'opacity .1s ease-in',
  margin: 4
})

interface Props {
  menuProps: MenuProps
  teamMember: JiraScopingSearchHistoryMenu_teamMember
  meetingId: string
}

const JiraScopingSearchHistoryMenu = (props: Props) => {
  const {menuProps, meetingId, teamMember} = props
  const {integrations, teamId} = teamMember
  const {atlassian} = integrations
  const {jiraSearchQueries} = atlassian!
  const atmosphere = useAtmosphere()
  const {portalStatus, isDropdown, closePortal} = menuProps

  const removeJiraSearchQuery = (jiraSearchQuery) => {
    const {queryString, isJQL, projectKeyFilters} = jiraSearchQuery

    PersistJiraSearchQueryMutation(atmosphere, {
      teamId,
      input: {queryString, isJQL, projectKeyFilters, isRemove: true}
    })
  }

  return (
    <Menu
      keepParentFocus
      ariaLabel={'Select a Jira search query'}
      portalStatus={portalStatus}
      isDropdown={isDropdown}
      closePortal={closePortal}
    >
      {jiraSearchQueries.length === 0 && (
        <NoResults key='no-results'>No saved queries yet!</NoResults>
      )}
      {jiraSearchQueries.map((jiraSearchQuery) => {
        const {id: queryId, queryString, isJQL, projectKeyFilters} = jiraSearchQuery
        const selectQuery = () => {
          commitLocalUpdate(atmosphere, (store) => {
            const searchQueryId = SearchQueryId.join('jira', meetingId)
            const jiraSearchQuery = store.get(searchQueryId)!
            jiraSearchQuery.setValue(isJQL, 'isJQL')
            jiraSearchQuery.setValue(queryString, 'queryString')
            jiraSearchQuery.setValue(projectKeyFilters as string[], 'projectKeyFilters')
          })
        }
        const queryStringLabel = isJQL ? queryString : `“${queryString}”`
        const projectFilters = projectKeyFilters
          .map((filter) => filter.slice(filter.indexOf(':') + 1))
          .join(', ')
        const handleRemoveJiraSearchQueryClick = (event: MouseEvent) => {
          if (jiraSearchQueries.length > 1) {
            event.stopPropagation() // prevents closing the menu when remove button is clicked
          }
          removeJiraSearchQuery(jiraSearchQuery)
        }
        return (
          <MenuItem
            key={queryId}
            label={
              <StyledMenuItemLabel>
                <StyledMenuItemContent>
                  <QueryString>{queryStringLabel}</QueryString>
                  {projectFilters && <ProjectFilter>{`in ${projectFilters}`}</ProjectFilter>}
                </StyledMenuItemContent>
                <DeleteIconButton
                  aria-label={'Remove this Jira Search Query'}
                  icon='cancel'
                  onClick={handleRemoveJiraSearchQueryClick}
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

export default createFragmentContainer(JiraScopingSearchHistoryMenu, {
  teamMember: graphql`
    fragment JiraScopingSearchHistoryMenu_teamMember on TeamMember {
      teamId
      integrations {
        atlassian {
          jiraSearchQueries {
            id
            queryString
            isJQL
            projectKeyFilters
          }
        }
      }
    }
  `
})
