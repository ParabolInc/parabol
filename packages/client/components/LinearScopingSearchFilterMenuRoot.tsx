import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import linearScopingSearchFilterMenuQuery, {
  LinearScopingSearchFilterMenuQuery
} from '../__generated__/LinearScopingSearchFilterMenuQuery.graphql'
import {LinearScopingSearchFilterMenuRoot_meeting$key} from '../__generated__/LinearScopingSearchFilterMenuRoot_meeting.graphql'
import {MenuProps} from '../hooks/useMenu'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import LinearScopingSearchFilterMenu from './LinearScopingSearchFilterMenu'
import MockFieldList from './MockFieldList'

interface Props {
  menuProps: MenuProps
  teamId: string
  meetingRef: LinearScopingSearchFilterMenuRoot_meeting$key
}

const LinearScopingSearchFilterMenuRoot = (props: Props) => {
  const {menuProps, teamId, meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment LinearScopingSearchFilterMenuRoot_meeting on PokerMeeting {
        id
      }
    `,
    meetingRef
  )
  const {id: meetingId} = meeting
  const queryRef = useQueryLoaderNow<LinearScopingSearchFilterMenuQuery>(
    linearScopingSearchFilterMenuQuery,
    {meetingId, teamId}
  )

  if (!meetingId) return null

  return (
    <Suspense fallback={<MockFieldList />}>
      {queryRef && <LinearScopingSearchFilterMenu queryRef={queryRef} menuProps={menuProps} />}
    </Suspense>
  )
}

export default LinearScopingSearchFilterMenuRoot
