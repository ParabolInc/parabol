import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import type {GitLabScopingSearchFilterToggle_meeting$key} from '../__generated__/GitLabScopingSearchFilterToggle_meeting.graphql'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import lazyPreload from '../utils/lazyPreload'
import FilterButton from './FilterButton'
import MockFieldList from './MockFieldList'

const GitLabScopingSearchFilterMenuRoot = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'GitLabScopingSearchFilterMenuRoot' */ './GitLabScopingSearchFilterMenuRoot'
    )
)
interface Props {
  meetingRef: GitLabScopingSearchFilterToggle_meeting$key
}

const GitLabScopingSearchFilterToggle = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment GitLabScopingSearchFilterToggle_meeting on PokerMeeting {
        ...GitLabScopingSearchFilterMenuRoot_meeting
        id
        teamId
      }
    `,
    meetingRef
  )
  const {teamId} = meeting
  return (
    <Menu trigger={<FilterButton onMouseEnter={GitLabScopingSearchFilterMenuRoot.preload} />}>
      <MenuContent align='end' className='w-[250px]'>
        <Suspense fallback={<MockFieldList />}>
          <GitLabScopingSearchFilterMenuRoot teamId={teamId} meetingRef={meeting} />
        </Suspense>
      </MenuContent>
    </Menu>
  )
}

export default GitLabScopingSearchFilterToggle
