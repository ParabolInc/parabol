import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {GitLabScopingSearchFilterToggle_meeting$key} from '../__generated__/GitLabScopingSearchFilterToggle_meeting.graphql'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import lazyPreload from '../utils/lazyPreload'
import FilterButton from './FilterButton'

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
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT, {
    loadingWidth: 200,
    noClose: true
  })
  return (
    <>
      <FilterButton onClick={togglePortal} ref={originRef} />
      {menuPortal(
        <GitLabScopingSearchFilterMenuRoot
          teamId={teamId}
          meetingRef={meeting}
          menuProps={menuProps}
        />
      )}
    </>
  )
}

export default GitLabScopingSearchFilterToggle
