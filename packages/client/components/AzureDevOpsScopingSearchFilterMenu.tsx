import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import type {
  AzureDevOpsScopingSearchFilterMenu_meeting$data,
  AzureDevOpsScopingSearchFilterMenu_meeting$key
} from '../__generated__/AzureDevOpsScopingSearchFilterMenu_meeting.graphql'
import type {MenuProps} from '../hooks/useMenu'
import Checkbox from './Checkbox'
import DropdownMenuLabel from './DropdownMenuLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'

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
            <Checkbox className='-ml-2 mr-2' active={isWIQL} />
            <span className='font-semibold'>{'Use WIQL'}</span>
          </MenuItemLabel>
        }
        onClick={toggleWIQL}
      />

      {projects.length > 0 && (
        <DropdownMenuLabel className='border-b-0'>Filter by project:</DropdownMenuLabel>
      )}
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
              <MenuItemLabel className={isWIQL ? 'opacity-50' : undefined}>
                <Checkbox
                  className='-ml-2 mr-2'
                  active={projectKeyFilters?.includes(name) ?? null}
                  disabled={isWIQL}
                />
                {name}
              </MenuItemLabel>
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
