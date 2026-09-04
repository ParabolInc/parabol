import type {MeetingTypeEnum} from '~/__generated__/MeetingSelectorQuery.graphql'
import useClientSideTrack from '../../hooks/useClientSideTrack'
import {ExternalLinks} from '../../types/constEnums'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuCopy from './HelpMenuCopy'
import HelpMenuHeader from './HelpMenuHeader'
import HelpMenuLink from './HelpMenuLink'

const linkLookup = {
  action: `${ExternalLinks.GETTING_STARTED_CHECK_INS}#icebreaker`,
  retrospective: `${ExternalLinks.GETTING_STARTED_RETROS}#icebreaker`,
  poker: `${ExternalLinks.GETTING_STARTED_SPRINT_POKER}#icebreaker`
} as Record<MeetingTypeEnum, string>

interface Props {
  onClose: () => void
  meetingType: MeetingTypeEnum
}

const CheckInHelpMenu = (props: Props) => {
  const {onClose} = props
  const {meetingType} = props
  useClientSideTrack('Help Menu Open', {phase: 'checkin'})
  return (
    <HelpMenuContent onClose={onClose}>
      <HelpMenuHeader>{phaseLabelLookup.checkin}</HelpMenuHeader>
      <HelpMenuCopy>
        {'The Icebreaker is an opportunity to quickly share some personal context with your team.'}
      </HelpMenuCopy>
      <HelpMenuCopy>
        {'Avoid cross-talk so that everybody can have uninterrupted airtime.'}
      </HelpMenuCopy>
      <HelpMenuLink copy='Learn More' href={linkLookup[meetingType]} />
    </HelpMenuContent>
  )
}

export default CheckInHelpMenu
