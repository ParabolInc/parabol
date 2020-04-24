import React, {forwardRef} from 'react'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuCopy from './HelpMenuCopy'
import HelpMenuLink from './HelpMenuLink'
import useSegmentTrack from '../../hooks/useSegmentTrack'
import {NewMeetingPhaseTypeEnum, SegmentClientEventEnum} from '../../types/graphql'
import {ExternalLinks} from '../../types/constEnums'

interface Props {}

const ActionMeetingLastCallHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  useSegmentTrack(SegmentClientEventEnum.HelpMenuOpen, {phase: NewMeetingPhaseTypeEnum.firstcall})
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
