import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import DiscussionThreadListEmptyState from './DiscussionThreadListEmptyState'
import {DiscussionThreadList_threadables} from '__generated__/DiscussionThreadList_threadables.graphql'
import {Elevation} from 'styles/elevation'
import ThreadedTask from './ThreadedTask'

const EmptyWrapper = styled('div')({
  alignItems: 'center',
  boxShadow: Elevation.DISCUSSION_THREAD_INSET,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'center'
})

const Wrapper = styled('div')({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
  paddingTop: 8
})

// https://stackoverflow.com/questions/36130760/use-justify-content-flex-end-and-to-have-vertical-scrollbar
const PusherDowner = styled('div')({
  margin: 'auto'
})

interface Props {
  threadables: DiscussionThreadList_threadables
}

const DiscussionThreadList = (props: Props) => {
  const {threadables} = props
  const isEmpty = threadables.length === 0
  if (isEmpty) {
    return (
      <EmptyWrapper>
        <DiscussionThreadListEmptyState />
      </EmptyWrapper>
    )
  }
  return (
    <Wrapper>
      <PusherDowner />
      {threadables.map((threadable) => {
        const {__typename, id} = threadable
        return __typename === 'Task' ? <ThreadedTask key={id} task={threadable} /> : null
      })}
    </Wrapper>
  )
}

export default createFragmentContainer(DiscussionThreadList, {
  threadables: graphql`
    fragment DiscussionThreadList_threadables on Threadable @relay(plural: true) {
      ...ThreadedTask_task
      __typename
      id
      content
    }
  `
})
