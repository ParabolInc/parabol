import React, {forwardRef} from 'react'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuCopy from './HelpMenuCopy'
import HelpMenuHeader from './HelpMenuHeader'
import HelpMenuLink from './HelpMenuLink'
import useSegmentTrack from '../../hooks/useSegmentTrack'
import {NewMeetingPhaseTypeEnum, SegmentClientEventEnum} from '../../types/graphql'
import {DISCUSS} from '../../utils/constants'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import {ExternalLinks} from '../../types/constEnums'

interface Props {}

const DiscussHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  useSegmentTrack(SegmentClientEventEnum.HelpMenuOpen, {phase: NewMeetingPhaseTypeEnum.discuss})
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>{phaseLabelLookup[DISCUSS]}</HelpMenuHeader>
      <HelpMenuCopy>
        The goal of this phase is to identify next steps and capture them as task cards assigned to
        an owner.
      </HelpMenuCopy>
      <HelpMenuCopy>
        Sometimes the next task is to schedule a time to discuss a topic more in depth at a later
        time.
      </HelpMenuCopy>
      <HelpMenuLink copy='Learn More' href={`${ExternalLinks.GETTING_STARTED_RETROS}#discuss`} />
    </HelpMenuContent>
  )
})

export default DiscussHelpMenu
