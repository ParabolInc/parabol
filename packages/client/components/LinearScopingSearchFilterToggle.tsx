import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {LinearScopingSearchFilterToggle_meeting$key} from '../__generated__/LinearScopingSearchFilterToggle_meeting.graphql'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import lazyPreload from '../utils/lazyPreload'
import FilterButton from './FilterButton'

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
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT, {
    loadingWidth: 200,
    noClose: true
  })
  return (
    <>
      <FilterButton onClick={togglePortal} ref={originRef} />
      {menuPortal(
        <LinearScopingSearchFilterMenuRoot
          teamId={teamId}
          meetingId={meeting.id}
          menuProps={menuProps}
        />
      )}
    </>
  )
}

export default LinearScopingSearchFilterToggle
