import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import DiscussionThreadListEmptyState from './DiscussionThreadListEmptyState'
import {DiscussionThreadList_threadables} from '__generated__/DiscussionThreadList_threadables.graphql'
import {Elevation} from 'styles/elevation'
import ThreadedTask from './ThreadedTask'

const Wrapper = styled('div')<{isEmpty: boolean}>(({isEmpty}) => ({
  alignItems: isEmpty ? 'center' : 'flex-end',
  boxShadow: Elevation.DISCUSSION_THREAD_INSET,
  display: 'flex',
  height: '100%',
  justifyContent: 'center'
}))

interface Props {
  threadables: DiscussionThreadList_threadables
}

const DiscussionThreadList = (props: Props) => {
  const {threadables} = props
  const isEmpty = threadables.length === 0
  return (
    <Wrapper isEmpty={false}>
      {isEmpty && <DiscussionThreadListEmptyState />}
      {threadables.map((threadable) => {
        const {__typename} = threadable
        return __typename === 'Task' ? <ThreadedTask task={threadable} /> : null
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
