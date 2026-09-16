import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import type {JiraScopingSearchFilterToggle_meeting$key} from '../__generated__/JiraScopingSearchFilterToggle_meeting.graphql'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import lazyPreload from '../utils/lazyPreload'
import FilterButton from './FilterButton'
import MockFieldList from './MockFieldList'

const JiraScopingSearchFilterMenuRoot = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'JiraScopingSearchFilterMenuRoot' */ './JiraScopingSearchFilterMenuRoot'
    )
)
interface Props {
  meetingRef: JiraScopingSearchFilterToggle_meeting$key
}

const JiraScopingSearchFilterToggle = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment JiraScopingSearchFilterToggle_meeting on PokerMeeting {
        id
        teamId
      }
    `,
    meetingRef
  )
  const {id: meetingId, teamId} = meeting
  return (
    <Menu trigger={<FilterButton onMouseEnter={JiraScopingSearchFilterMenuRoot.preload} />}>
      <MenuContent align='end' className='w-[250px]'>
        <Suspense fallback={<MockFieldList />}>
          <JiraScopingSearchFilterMenuRoot teamId={teamId} meetingId={meetingId} />
        </Suspense>
      </MenuContent>
    </Menu>
  )
}

export default JiraScopingSearchFilterToggle
