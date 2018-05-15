import PropTypes from 'prop-types'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import styled from 'react-emotion'

const GreetingBlock = styled('div')({
  fontSize: '1.5rem'
})

const GreetingSpan = styled('span')({
  borderBottom: '.0625rem dashed currentColor',
  color: 'inherit',
  cursor: 'help',
  fontStyle: 'italic'
})

const MeetingCheckInGreeting = ({currentName, team: {greeting}}) => (
  <GreetingBlock>
    <GreetingSpan title={`${greeting.content} means “hello” in ${greeting.language}`}>
      {greeting.content}
    </GreetingSpan>
    {`, ${currentName}:`}
  </GreetingBlock>
)

MeetingCheckInGreeting.propTypes = {
  currentName: PropTypes.string.isRequired,
  team: PropTypes.object.isRequired
}

export default createFragmentContainer(
  MeetingCheckInGreeting,
  graphql`
    fragment MeetingCheckInGreeting_team on Team {
      greeting: checkInGreeting {
        content
        language
      }
    }
  `
)
