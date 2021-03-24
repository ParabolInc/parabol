import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {MeetingsDash_viewer} from '~/__generated__/MeetingsDash_viewer.graphql'
import MeetingCard from './MeetingCard'

interface Props {
  viewer: MeetingsDash_viewer
}

const Wrapper = styled('div')({
  display: 'flex',
  margin: '0 auto',
  maxWidth: 1600,
  width: '100%'
})

const MeetingsDash = (props: Props) => {
  const {viewer} = props
  const {teams} = viewer
  const activeMeetings = teams.flatMap((team) => team.activeMeetings)
  const hasMeetings = activeMeetings.length > 0
  return (
    <Wrapper>
      {hasMeetings
        ? <>{activeMeetings.map((meeting, idx) => <MeetingCard key={idx} meeting={meeting} />)}</>
        : 'No meetings, yay! More focus time! But you can start one below if you need'
      }
    </Wrapper>
  )
}

export default createFragmentContainer(MeetingsDash, {
  viewer: graphql`
    fragment MeetingsDash_viewer on User {
      teams {
        activeMeetings {
          ...MeetingCard_meeting
        }
      }
    }
  `
})
