import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import type {
  AzureDevOpsScopingSearchFilterMenu_meeting$data,
  AzureDevOpsScopingSearchFilterMenu_meeting$key
} from '../__generated__/AzureDevOpsScopingSearchFilterMenu_meeting.graphql'
import {MenuItem} from '../ui/Menu/MenuItem'
import Checkbox from './Checkbox'
import DropdownMenuLabel from './DropdownMenuLabel'

interface Props {
  meeting: AzureDevOpsScopingSearchFilterMenu_meeting$key
}

type AzureDevOpsSearchQuery = NonNullable<
  NonNullable<AzureDevOpsScopingSearchFilterMenu_meeting$data>['azureDevOpsSearchQuery']
>

const AzureDevOpsScopingSearchFilterMenu = (props: Props) => {
  const {meeting: meetingRef} = props
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
    <>
      <MenuItem onSelect={(e) => e.preventDefault()} onClick={toggleWIQL}>
        <Checkbox className='-ml-2 mr-2' active={isWIQL} />
        <span className='font-semibold'>{'Use WIQL'}</span>
      </MenuItem>

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
            className={isWIQL ? 'opacity-50' : undefined}
            onSelect={(e) => e.preventDefault()}
            onClick={isWIQL ? undefined : toggleProjectKeyFilter}
            isDisabled={isWIQL}
          >
            <Checkbox
              className='-ml-2 mr-2'
              active={projectKeyFilters?.includes(name) ?? null}
              disabled={isWIQL}
            />
            {name}
          </MenuItem>
        )
      })}
    </>
  )
}

export default AzureDevOpsScopingSearchFilterMenu
