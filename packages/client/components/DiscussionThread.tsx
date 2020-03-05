import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import DiscussionThreadList from './DiscussionThreadList'
import {DiscussionThreadEnum} from 'types/constEnums'
import {Elevation} from '../styles/elevation'
import {DiscussionThread_reflectionGroup} from '__generated__/DiscussionThread_reflectionGroup.graphql'
import DiscussionThreadInput from './DiscussionThreadInput'
import {DiscussionThread_meeting} from '__generated__/DiscussionThread_meeting.graphql'

const Wrapper = styled('div')({
  background: '#fff',
  borderRadius: 4,
  boxShadow: Elevation.DISCUSSION_THREAD,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  marginBottom: 16,
  width: DiscussionThreadEnum.WIDTH
})

interface Props {
  meeting: DiscussionThread_meeting
  reflectionGroup: DiscussionThread_reflectionGroup
}

const DiscussionThread = (props: Props) => {
  const {meeting, reflectionGroup} = props
  const {thread} = reflectionGroup
  const {edges} = thread
  const threadables = edges.map(({node}) => node)
  return (
    <Wrapper>
      <DiscussionThreadList threadables={threadables} />
      <DiscussionThreadInput meeting={meeting} />
    </Wrapper>
  )
}

export default createFragmentContainer(DiscussionThread, {
  meeting: graphql`
    fragment DiscussionThread_meeting on RetrospectiveMeeting {
      ...DiscussionThreadInput_meeting
    }
  `,
  reflectionGroup: graphql`
    fragment DiscussionThread_reflectionGroup on RetroReflectionGroup {
      thread(first: 1000) @connection(key: "DiscussionThread_thread") {
        edges {
          node {
            ...DiscussionThreadList_threadables
          }
        }
      }
    }
  `
})
