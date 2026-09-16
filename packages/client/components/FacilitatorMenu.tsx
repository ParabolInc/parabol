import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {FacilitatorMenu_meeting$key} from '../__generated__/FacilitatorMenu_meeting.graphql'
import {MenuContent} from '../ui/Menu/MenuContent'
import FacilitatorRotationPanel from './FacilitatorRotationPanel'

interface Props {
  meeting: FacilitatorMenu_meeting$key
  onClose: () => void
}

const FacilitatorMenu = (props: Props) => {
  const {meeting: meetingRef, onClose} = props
  const meeting = useFragment(
    graphql`
      fragment FacilitatorMenu_meeting on NewMeeting {
        ...FacilitatorRotationPanel_meeting
      }
    `,
    meetingRef
  )
  return (
    <MenuContent align='end' className='max-h-[none] overflow-y-visible'>
      <FacilitatorRotationPanel meeting={meeting} onDone={onClose} />
    </MenuContent>
  )
}

export default FacilitatorMenu
