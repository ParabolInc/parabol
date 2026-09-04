import type {TeamPromptWorkDrawer_meeting$key} from '~/__generated__/TeamPromptWorkDrawer_meeting.graphql'
import {BottomSheet} from '../../../../ui/BottomSheet/BottomSheet'
import TeamPromptWorkDrawer from '../../TeamPromptWorkDrawer'

interface Props {
  meetingRef: TeamPromptWorkDrawer_meeting$key
  isOpen: boolean
  onClose: () => void
}

const InspirationBottomSheet = (props: Props) => {
  const {meetingRef, isOpen, onClose} = props
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} ariaLabel='Inspiration'>
      <TeamPromptWorkDrawer
        meetingRef={meetingRef}
        variant='sheet'
        onClose={onClose}
        onAdded={onClose}
      />
    </BottomSheet>
  )
}

export default InspirationBottomSheet
