import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ParabolScopingSearchFilterToggle_meeting$key} from '../__generated__/ParabolScopingSearchFilterToggle_meeting.graphql'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import FilterButton from './FilterButton'
import ParabolScopingSearchFilterMenu from './ParabolScopingSearchFilterMenu'

interface Props {
  meeting: ParabolScopingSearchFilterToggle_meeting$key
}

const ParabolScopingSearchFilterToggle = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ParabolScopingSearchFilterToggle_meeting on PokerMeeting {
        id
        ...ParabolScopingSearchFilterMenu_meeting
      }
    `,
    meetingRef
  )
  return (
    <Menu trigger={<FilterButton />}>
      <MenuContent align='end'>
        <ParabolScopingSearchFilterMenu meeting={meeting} />
      </MenuContent>
    </Menu>
  )
}

export default ParabolScopingSearchFilterToggle
