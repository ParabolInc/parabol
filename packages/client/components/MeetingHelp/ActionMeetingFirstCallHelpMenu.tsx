import useClientSideTrack from '../../hooks/useClientSideTrack'
import {ExternalLinks} from '../../types/constEnums'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuCopy from './HelpMenuCopy'
import HelpMenuLink from './HelpMenuLink'

interface Props {
  onClose: () => void
}

const ActionMeetingFirstCallHelpMenu = (props: Props) => {
  const {onClose} = props
  useClientSideTrack('Help Menu Open', {phase: 'firstcall'})
  return (
    <HelpMenuContent onClose={onClose}>
      <HelpMenuCopy>{'Time to add any remaining Agenda topics for discussion!'}</HelpMenuCopy>
      <HelpMenuCopy>
        {'You can contribute to the Agenda any time: before a meeting begins, or during a meeting.'}
      </HelpMenuCopy>
      <HelpMenuCopy>
        {'For those that like keyboard shortcuts, you can simply press the “+” key to add.'}
      </HelpMenuCopy>
      <HelpMenuLink
        copy='Learn more'
        href={`${ExternalLinks.GETTING_STARTED_CHECK_INS}#team-agenda`}
      />
    </HelpMenuContent>
  )
}

export default ActionMeetingFirstCallHelpMenu
