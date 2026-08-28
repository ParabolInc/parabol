import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {FacilitatorMenu_meeting$key} from '../__generated__/FacilitatorMenu_meeting.graphql'
import Menu from '../components/Menu'
import type {MenuProps} from '../hooks/useMenu'
import FacilitatorRotationPanel from './FacilitatorRotationPanel'

interface Props {
  menuProps: MenuProps
  meeting: FacilitatorMenu_meeting$key
}

const FacilitatorMenu = (props: Props) => {
  const {menuProps, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment FacilitatorMenu_meeting on NewMeeting {
        ...FacilitatorRotationPanel_meeting
      }
    `,
    meetingRef
  )
  return (
    <Menu
      ariaLabel={'Edit the facilitator rotation'}
      className={'max-h-[none] overflow-y-visible'}
      {...menuProps}
    >
      <FacilitatorRotationPanel meeting={meeting} onDone={menuProps.closePortal} />
    </Menu>
  )
}

export default FacilitatorMenu
