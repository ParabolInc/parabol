import {forwardRef} from 'react'
import useClientSideTrack from '../../hooks/useClientSideTrack'
import {ExternalLinks} from '../../types/constEnums'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuCopy from './HelpMenuCopy'
import HelpMenuLink from './HelpMenuLink'

interface Props {}

const ActionMeetingLastCallHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  useClientSideTrack('Help Menu Open', {phase: 'firstcall'})
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuCopy>{'Here’s a chance to add any last topics for discussion.'}</HelpMenuCopy>
      <HelpMenuCopy>
        {'A Meeting Summary will be generated once the Facilitator ends the meeting.'}
      </HelpMenuCopy>
      <HelpMenuLink
        copy='Learn more'
        href={`${ExternalLinks.GETTING_STARTED_CHECK_INS}#team-agenda`}
      />
    </HelpMenuContent>
  )
})

export default ActionMeetingLastCallHelpMenu
