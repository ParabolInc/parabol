import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import type {ParabolSearchQuery} from '~/types/clientSchema'
import {taskScopingStatusFilters} from '~/utils/constants'
import type {ParabolScopingSearchFilterMenu_meeting$key} from '../__generated__/ParabolScopingSearchFilterMenu_meeting.graphql'
import {MenuItem} from '../ui/Menu/MenuItem'
import Checkbox from './Checkbox'
import DropdownMenuLabel from './DropdownMenuLabel'

interface Props {
  meeting: ParabolScopingSearchFilterMenu_meeting$key
}

const ParabolScopingSearchFilterMenu = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ParabolScopingSearchFilterMenu_meeting on PokerMeeting {
        id
        parabolSearchQuery {
          queryString
          statusFilters
        }
      }
    `,
    meetingRef
  )
  const {parabolSearchQuery, id: meetingId} = meeting
  const {statusFilters} = parabolSearchQuery
  const atmosphere = useAtmosphere()
  return (
    <>
      <DropdownMenuLabel className='border-b-0'>Filter by status:</DropdownMenuLabel>
      {taskScopingStatusFilters.map((status) => {
        const toggleStatusFilter = () => {
          commitLocalUpdate(atmosphere, (store) => {
            const meeting = store.get(meetingId)!
            const parabolSearchQuery =
              meeting.getLinkedRecord<ParabolSearchQuery>('parabolSearchQuery')
            const statusFiltersProxy = parabolSearchQuery.getValue('statusFilters')?.slice() ?? []
            const keyIdx = statusFiltersProxy.indexOf(status)
            keyIdx !== -1 ? statusFiltersProxy.splice(keyIdx, 1) : statusFiltersProxy.push(status)
            parabolSearchQuery.setValue(statusFiltersProxy, 'statusFilters')
          })
        }
        return (
          <MenuItem key={status} onSelect={(e) => e.preventDefault()} onClick={toggleStatusFilter}>
            <Checkbox className='-ml-2 mr-2' active={statusFilters?.includes(status) ?? null} />
            {status}
          </MenuItem>
        )
      })}
    </>
  )
}

export default ParabolScopingSearchFilterMenu
