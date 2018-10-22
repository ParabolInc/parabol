import React from 'react'
import {ACTION, CHECKIN, RETROSPECTIVE} from 'universal/utils/constants'
import withHelpMenu from 'universal/components/MeetingHelp/withHelpMenu'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import HelpMenuLink from 'universal/components/MeetingHelp/HelpMenuLink'

const linkLookup = {
  [ACTION]: 'https://www.parabol.co/getting-started-guide/action-meetings-101#social-check-in',
  [RETROSPECTIVE]:
    'https://www.parabol.co/getting-started-guide/retrospective-meetings-101#social-check-in'
}

const CheckInHelpMenu = (props) => {
  const {closePortal, isFacilitating, meetingType} = props
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>{phaseLabelLookup[CHECKIN]}</HelpMenuHeader>
      <HelpMenuCopy>
        The Social Check-In is an opportunity to quickly share some personal context with your team.
      </HelpMenuCopy>
      <HelpMenuCopy>
        Avoid cross-talk so that everybody can have uninterrupted airtime.
      </HelpMenuCopy>
      {isFacilitating && (
        <HelpMenuCopy>
          <b>Facilitator</b>, mark people as “here” or “not here” using the bottom bar.
        </HelpMenuCopy>
      )}
      <HelpMenuLink copy='Learn More' href={linkLookup[meetingType]} />
    </HelpMenuContent>
  )
}

export default withHelpMenu(CheckInHelpMenu)
