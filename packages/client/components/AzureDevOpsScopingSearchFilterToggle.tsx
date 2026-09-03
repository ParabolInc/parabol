import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {AzureDevOpsScopingSearchFilterToggle_meeting$key} from '../__generated__/AzureDevOpsScopingSearchFilterToggle_meeting.graphql'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import AzureDevOpsScopingSearchFilterMenu from './AzureDevOpsScopingSearchFilterMenu'
import FilterButton from './FilterButton'

interface Props {
  meeting: AzureDevOpsScopingSearchFilterToggle_meeting$key
}

const AzureDevOpsScopingSearchFilterToggle = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment AzureDevOpsScopingSearchFilterToggle_meeting on PokerMeeting {
        id
        ...AzureDevOpsScopingSearchFilterMenu_meeting
      }
    `,
    meetingRef
  )
  return (
    <Menu trigger={<FilterButton />}>
      <MenuContent align='end'>
        <AzureDevOpsScopingSearchFilterMenu meeting={meeting} />
      </MenuContent>
    </Menu>
  )
}

export default AzureDevOpsScopingSearchFilterToggle
