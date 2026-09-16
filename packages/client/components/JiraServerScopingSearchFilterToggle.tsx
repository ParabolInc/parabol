import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import type {JiraServerScopingSearchFilterToggle_meeting$key} from '../__generated__/JiraServerScopingSearchFilterToggle_meeting.graphql'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import lazyPreload from '../utils/lazyPreload'
import FilterButton from './FilterButton'
import MockFieldList from './MockFieldList'

const JiraServerScopingSearchFilterMenuRoot = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'JiraServerScopingSearchFilterMenuRoot' */ './JiraServerScopingSearchFilterMenuRoot'
    )
)
interface Props {
  meetingRef: JiraServerScopingSearchFilterToggle_meeting$key
}

const JiraServerScopingSearchFilterToggle = (props: Props) => {
  const {meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment JiraServerScopingSearchFilterToggle_meeting on PokerMeeting {
        id
        teamId
      }
    `,
    meetingRef
  )

  const {id: meetingId, teamId} = meeting
  return (
    <Menu trigger={<FilterButton onMouseEnter={JiraServerScopingSearchFilterMenuRoot.preload} />}>
      <MenuContent align='end' className='w-[250px]'>
        <Suspense fallback={<MockFieldList />}>
          <JiraServerScopingSearchFilterMenuRoot teamId={teamId} meetingId={meetingId} />
        </Suspense>
      </MenuContent>
    </Menu>
  )
}

export default JiraServerScopingSearchFilterToggle
