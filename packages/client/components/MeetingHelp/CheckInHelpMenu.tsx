import React, {forwardRef} from 'react'
import useSegmentTrack from '../../hooks/useSegmentTrack'
import {ExternalLinks} from '../../types/constEnums'
import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from '../../types/graphql'
import {CHECKIN} from '../../utils/constants'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuCopy from './HelpMenuCopy'
import HelpMenuHeader from './HelpMenuHeader'
import HelpMenuLink from './HelpMenuLink'

const linkLookup = {
  [MeetingTypeEnum.action]: `${ExternalLinks.GETTING_STARTED_CHECK_INS}#icebreaker`,
  [MeetingTypeEnum.retrospective]: `${ExternalLinks.GETTING_STARTED_RETROS}#icebreaker`
}

interface Props {
  meetingType: string
}

const CheckInHelpMenu = forwardRef((props: Props, ref: any) => {
  const {closePortal} = ref
  const {meetingType} = props
  useSegmentTrack('Help Menu Open', {phase: NewMeetingPhaseTypeEnum.checkin})
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>{phaseLabelLookup[CHECKIN]}</HelpMenuHeader>
      <HelpMenuCopy>
        {'The Icebreaker is an opportunity to quickly share some personal context with your team.'}
      </HelpMenuCopy>
      <HelpMenuCopy>
        {'Avoid cross-talk so that everybody can have uninterrupted airtime.'}
      </HelpMenuCopy>
      <HelpMenuLink copy='Learn More' href={linkLookup[meetingType]} />
    </HelpMenuContent>
  )
})

export default CheckInHelpMenu
