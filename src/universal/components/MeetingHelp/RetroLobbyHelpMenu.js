import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import React from 'react'
import withHelpMenu from 'universal/components/MeetingHelp/withHelpMenu'
import HelpMenuLink from 'universal/components/MeetingHelp/HelpMenuLink'

const RetroLobbyHelpMenu = (props) => {
  const {closePortal} = props
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuCopy>
        {
          'Our software guides your team to surface your teammates’ recent experiences, group them into themes, and develop an action plan, capture learnings, and make improvements.'
        }
      </HelpMenuCopy>
      <div>
        {'See our '}
        <HelpMenuLink
          copy='Getting Started Guide'
          href='https://www.parabol.co/getting-started-guide/retrospective-meetings-101'
        />
        {' for running a Retrospective Meeting.'}
      </div>
    </HelpMenuContent>
  )
}

export default withHelpMenu(RetroLobbyHelpMenu)
