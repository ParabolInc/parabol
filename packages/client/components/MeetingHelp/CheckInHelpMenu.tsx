import React, {forwardRef} from 'react'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuCopy from './HelpMenuCopy'
import HelpMenuHeader from './HelpMenuHeader'
import HelpMenuLink from './HelpMenuLink'
import useSegmentTrack from '../../hooks/useSegmentTrack'
import {MeetingTypeEnum, NewMeetingPhaseTypeEnum, SegmentClientEventEnum} from '../../types/graphql'
import {CHECKIN} from '../../utils/constants'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import {ExternalLinks} from '../../types/constEnums'

const linkLookup = {
  [MeetingTypeEnum.action]: `${ExternalLinks.GETTING_STARTED_CHECK_INS}#social-check-in`,
  [MeetingTypeEnum.retrospective]: `${ExternalLinks.GETTING_STARTED_RETROS}#social-check-in`
}

interface Props {
  meetingType: string
}

const CheckInHelpMenu = forwardRef((props: Props, ref: any) => {
  const {closePortal} = ref
  const {meetingType} = props
  useSegmentTrack(SegmentClientEventEnum.HelpMenuOpen, {phase: NewMeetingPhaseTypeEnum.checkin})
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>{phaseLabelLookup[CHECKIN]}</HelpMenuHeader>
      <HelpMenuCopy>
        {
          'The Social Check-in is an opportunity to quickly share some personal context with your team.'
        }
      </HelpMenuCopy>
      <HelpMenuCopy>
        {'Avoid cross-talk so that everybody can have uninterrupted airtime.'}
      </HelpMenuCopy>
      <HelpMenuLink copy='Learn More' href={linkLookup[meetingType]} />
    </HelpMenuContent>
  )
})

export default CheckInHelpMenu
