import React from 'react'
import styled from 'react-emotion'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import withHelpMenu from 'universal/components/MeetingHelp/withHelpMenu'
import withDemoHelpMenu from './withDemoHelpMenu'

const StyledCopy = styled(HelpMenuCopy)({margin: 0})

const ReflectHelpMenu = ({closePortal}) => (
  <HelpMenuContent closePortal={closePortal}>
    <HelpMenuHeader>Welcome to the Parabol Retro Demo!</HelpMenuHeader>
    <HelpMenuCopy>
      When meeting, each team member signs in to Parabol, often while on a video conference.
    </HelpMenuCopy>
    <HelpMenuCopy>
      Our scripted Demo Team is adding reflections for a recent project. Try adding a few of your
      own.
    </HelpMenuCopy>
    <HelpMenuCopy>
      During this phase nobody can see your reflections. After this phase reflections will be
      visible, but remain anonymous.
    </HelpMenuCopy>
    <StyledCopy>Use the bottom bar to move forward.</StyledCopy>
  </HelpMenuContent>
)

export default withDemoHelpMenu(withHelpMenu(ReflectHelpMenu))
