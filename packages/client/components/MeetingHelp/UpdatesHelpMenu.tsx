import React, {forwardRef} from 'react'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuCopy from './HelpMenuCopy'
import HelpMenuHeader from './HelpMenuHeader'
import HelpMenuLink from './HelpMenuLink'
import useSegmentTrack from '../../hooks/useSegmentTrack'
import {NewMeetingPhaseTypeEnum, SegmentClientEventEnum} from '../../types/graphql'
import {phaseLabelLookup} from '../../utils/meetings/lookups'

interface Props {}

const UpdatesHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  useSegmentTrack(SegmentClientEventEnum.HelpMenuOpen, {phase: NewMeetingPhaseTypeEnum.updates})
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>{phaseLabelLookup[NewMeetingPhaseTypeEnum.updates]}</HelpMenuHeader>
      <HelpMenuCopy>
        {
          'During this phase each teammate has uninterrupted airtime to give an update on their work.'
        }
      </HelpMenuCopy>
      <HelpMenuCopy>
        {
          'Help keep your team stay on schedule by adding Agenda topics to the queue if updates inspire the need for discussion.'
        }
      </HelpMenuCopy>
      <HelpMenuLink
        copy='Learn More'
        href={`https://www.parabol.co/getting-started-guide/action-meetings-101#solo-updates`}
      />
    </HelpMenuContent>
  )
})

export default UpdatesHelpMenu
