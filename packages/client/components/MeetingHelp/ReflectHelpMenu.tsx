import React, {forwardRef} from 'react'
import useSegmentTrack from '../../hooks/useSegmentTrack'
import {NewMeetingPhaseTypeEnum, SegmentClientEventEnum} from '../../types/graphql'
import {REFLECT} from '../../utils/constants'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuHeader from './HelpMenuHeader'
import HelpMenuCopy from './HelpMenuCopy'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import HelpMenuLink from './HelpMenuLink'
import {ExternalLinks} from '../../types/constEnums'

interface Props {}

const ReflectHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  useSegmentTrack(SegmentClientEventEnum.HelpMenuOpen, {phase: NewMeetingPhaseTypeEnum.reflect})
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>{phaseLabelLookup[REFLECT]}</HelpMenuHeader>
      <HelpMenuCopy>The goal of this phase is to gather honest input from the team.</HelpMenuCopy>
      <HelpMenuCopy>
        As a group, reflect on how work’s going for a specific project or timeframe.
      </HelpMenuCopy>
      <HelpMenuCopy>
        During this phase nobody can see your reflections. After this phase reflections will be
        visible, but remain anonymous.
      </HelpMenuCopy>
      <HelpMenuLink copy='Learn More' href={`${ExternalLinks.GETTING_STARTED_RETROS}#reflect`} />
    </HelpMenuContent>
  )
})

export default ReflectHelpMenu
