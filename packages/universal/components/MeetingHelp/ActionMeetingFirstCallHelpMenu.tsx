import React, {forwardRef} from 'react'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuCopy from './HelpMenuCopy'
import HelpMenuLink from './HelpMenuLink'
import useSegmentTrack from '../../hooks/useSegmentTrack'
import {NewMeetingPhaseTypeEnum, SegmentClientEventEnum} from '../../types/graphql'

interface Props {}

const ActionMeetingFirstCallHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  useSegmentTrack(SegmentClientEventEnum.HelpMenuOpen, {phase: NewMeetingPhaseTypeEnum.firstcall})
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuCopy>{'Time to add any remaining Agenda topics for discussion!'}</HelpMenuCopy>
      <HelpMenuCopy>
        {'You can contribute to the Agenda any time: before a meeting begins, or during a meeting.'}
      </HelpMenuCopy>
      <HelpMenuCopy>
        {'For those that like keyboard shortcuts, you can simply press the “+” key to add.'}
      </HelpMenuCopy>
      <HelpMenuLink
        copy='Learn more'
        href='https://www.parabol.co/getting-started-guide/action-meetings-101#team-agenda'
      />
    </HelpMenuContent>
  )
})

export default ActionMeetingFirstCallHelpMenu
