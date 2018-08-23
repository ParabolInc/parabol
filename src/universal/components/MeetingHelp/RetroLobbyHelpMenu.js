import HelpMenuBody from 'universal/components/MeetingHelp/HelpMenuBody'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import React from 'react'
import withHelpMenu from 'universal/components/MeetingHelp/withHelpMenu'
import HelpMenuLink from 'universal/components/MeetingHelp/HelpMenuLink'

const RetroLobbyHelpMenu = (props) => {
  const {closePortal, isPro} = props
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuBody>
        {isPro ? (
          <React.Fragment>
            <p>{'The person who presses “Start Meeting” will be today’s Facilitator.'}</p>
            <p>{'Everyone’s display automatically follows the Facilitator.'}</p>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <p>
              {
                'Running a retrospective is the most effective way to learn how your team can work smarter.'
              }
            </p>
            <p>
              {
                'In 30 minutes you can discover underlying tensions, create next steps, and have a summary delivered to your inbox.'
              }
            </p>
          </React.Fragment>
        )}
        <p>
          {'See our '}
          <HelpMenuLink
            copy='Getting Started Guide'
            href='https://www.parabol.co/getting-started-guide/retrospective-meetings-101'
          />
          {' for running a Retrospective Meeting.'}
        </p>
      </HelpMenuBody>
    </HelpMenuContent>
  )
}

export default withHelpMenu(RetroLobbyHelpMenu)
