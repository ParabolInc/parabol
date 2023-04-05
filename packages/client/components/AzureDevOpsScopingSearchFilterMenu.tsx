import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import {
  AzureDevOpsScopingSearchFilterMenu_meeting$data,
  AzureDevOpsScopingSearchFilterMenu_meeting$key
} from '../__generated__/AzureDevOpsScopingSearchFilterMenu_meeting.graphql'
import Checkbox from './Checkbox'
import DropdownMenuLabel from './DropdownMenuLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'

const StyledMenuItemLabel = styled(MenuItemLabel)<{isDisabled: boolean}>(({isDisabled}) => ({
  opacity: isDisabled ? 0.5 : undefined
}))

const StyledCheckBox = styled(Checkbox)({
  marginLeft: -8,
  marginRight: 8
})

const FilterLabel = styled(DropdownMenuLabel)({
  borderBottom: 0
})

const UseWIQLLabel = styled('span')({
  fontWeight: 600
})

interface Props {
  menuProps: MenuProps
  meeting: AzureDevOpsScopingSearchFilterMenu_meeting$key
}

type AzureDevOpsSearchQuery = NonNullable<
  NonNullable<AzureDevOpsScopingSearchFilterMenu_meeting$data>['azureDevOpsSearchQuery']
>

const AzureDevOpsScopingSearchFilterMenu = (props: Props) => {
  const {meeting: meetingRef, menuProps} = props
  const meeting = useFragment(
    graphql`
      fragment AzureDevOpsScopingSearchFilterMenu_meeting on PokerMeeting {
        id
        azureDevOpsSearchQuery {
          projectKeyFilters
          isWIQL
        }
        viewerMeetingMember {
          teamMember {
            integrations {
              azureDevOps {
                projects {
                  id
                  name
                }
              }
            }
          }
        }
      }
    `,
    meetingRef
  )
  const {portalStatus, isDropdown} = menuProps
  const {viewerMeetingMember, azureDevOpsSearchQuery, id: meetingId} = meeting
  const {isWIQL, projectKeyFilters} = azureDevOpsSearchQuery
  const projects = viewerMeetingMember?.teamMember.integrations.azureDevOps.projects ?? []
  const atmosphere = useAtmosphere()
  const toggleWIQL = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get(meetingId)
      if (!meeting) return
      const azureDevOpsSearchQuery = meeting.getLinkedRecord('azureDevOpsSearchQuery')!
      // this might bork if the checkbox is ticked before the full query loads
      if (!azureDevOpsSearchQuery) return
      azureDevOpsSearchQuery.setValue(!isWIQL, 'isWIQL')
      azureDevOpsSearchQuery.setValue([], 'projectKeyFilters')
    })
  }
  return (
    <Menu
      keepParentFocus
      ariaLabel={'Define the Azure DevOps search query'}
      portalStatus={portalStatus}
      isDropdown={isDropdown}
    >
      <MenuItem
        key={'isWIQL'}
        label={
          <MenuItemLabel>
            <StyledCheckBox active={isWIQL} />
            <UseWIQLLabel>{'Use WIQL'}</UseWIQLLabel>
          </MenuItemLabel>
        }
        onClick={toggleWIQL}
      />

      {projects.length > 0 && <FilterLabel>Filter by project:</FilterLabel>}
      {projects.map((project) => {
        const {id: globalProjectKey, name} = project
        const toggleProjectKeyFilter = () => {
          commitLocalUpdate(atmosphere, (store) => {
            const meeting = store.get(meetingId)!
            const azureDevOpsSearchQuery =
              meeting.getLinkedRecord<AzureDevOpsSearchQuery>('azureDevOpsSearchQuery')!
            const projectKeyFiltersProxy = azureDevOpsSearchQuery
              .getValue('projectKeyFilters')!
              .slice()
            const keyIdx = projectKeyFiltersProxy.indexOf(name)
            keyIdx !== -1
              ? projectKeyFiltersProxy.splice(keyIdx, 1)
              : projectKeyFiltersProxy.push(name)
            azureDevOpsSearchQuery.setValue(projectKeyFiltersProxy, 'projectKeyFilters')
          })
        }
        return (
          <MenuItem
            key={globalProjectKey}
            label={
              <StyledMenuItemLabel isDisabled={isWIQL}>
                <StyledCheckBox
                  active={projectKeyFilters?.includes(name) ?? null}
                  disabled={isWIQL}
                />
                {name}
              </StyledMenuItemLabel>
            }
            onClick={toggleProjectKeyFilter}
            isDisabled={isWIQL}
          />
        )
      })}
    </Menu>
  )
}

export default AzureDevOpsScopingSearchFilterMenu
