import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import type {LinearScopingSearchFilterToggle_meeting$key} from '../__generated__/LinearScopingSearchFilterToggle_meeting.graphql'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import lazyPreload from '../utils/lazyPreload'
import FilterButton from './FilterButton'
import MockFieldList from './MockFieldList'

const LinearScopingSearchFilterMenuRoot = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'LinearScopingSearchFilterMenuRoot' */ './LinearScopingSearchFilterMenuRoot'
    )
)
interface Props {
  meetingRef: LinearScopingSearchFilterToggle_meeting$key
}

const LinearScopingSearchFilterToggle = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment LinearScopingSearchFilterToggle_meeting on PokerMeeting {
        id
        teamId
      }
    `,
    meetingRef
  )
  const {teamId} = meeting
  return (
    <Menu trigger={<FilterButton onMouseEnter={LinearScopingSearchFilterMenuRoot.preload} />}>
      <MenuContent align='end' className='w-[250px]'>
        <Suspense fallback={<MockFieldList />}>
          <LinearScopingSearchFilterMenuRoot teamId={teamId} meetingId={meeting.id} />
        </Suspense>
      </MenuContent>
    </Menu>
  )
}

export default LinearScopingSearchFilterToggle
