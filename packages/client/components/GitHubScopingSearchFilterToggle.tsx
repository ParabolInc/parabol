import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import type {GitHubScopingSearchFilterToggle_meeting$key} from '../__generated__/GitHubScopingSearchFilterToggle_meeting.graphql'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import lazyPreload from '../utils/lazyPreload'
import FilterButton from './FilterButton'
import MockFieldList from './MockFieldList'

const GitHubScopingSearchFilterMenuRoot = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'GitHubScopingSearchFilterMenuRoot' */ './GitHubScopingSearchFilterMenuRoot'
    )
)
interface Props {
  meetingRef: GitHubScopingSearchFilterToggle_meeting$key
}

const GitHubScopingSearchFilterToggle = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment GitHubScopingSearchFilterToggle_meeting on PokerMeeting {
        ...GitHubScopingSearchFilterMenuRoot_meeting
        id
        teamId
      }
    `,
    meetingRef
  )
  const {teamId} = meeting
  return (
    <Menu trigger={<FilterButton onMouseEnter={GitHubScopingSearchFilterMenuRoot.preload} />}>
      <MenuContent align='end' className='w-[250px]'>
        <Suspense fallback={<MockFieldList />}>
          <GitHubScopingSearchFilterMenuRoot teamId={teamId} meetingRef={meeting} />
        </Suspense>
      </MenuContent>
    </Menu>
  )
}

export default GitHubScopingSearchFilterToggle
