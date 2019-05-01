import React, {forwardRef} from 'react'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import HelpMenuLink from 'universal/components/MeetingHelp/HelpMenuLink'

interface Props {}

const RetroLobbyHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
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
})

export default RetroLobbyHelpMenu
