import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import DiscussionThreadListEmptyState from './DiscussionThreadListEmptyState'
import {DiscussionThreadList_threadables} from '__generated__/DiscussionThreadList_threadables.graphql'

const Wrapper = styled('div')({})

interface Props {
  threadables: DiscussionThreadList_threadables
}

const DiscussionThreadList = (props: Props) => {
  const {threadables} = props
  const isEmpty = threadables.length === 0
  if (isEmpty) return <DiscussionThreadListEmptyState />
  return <Wrapper></Wrapper>
}

export default createFragmentContainer(DiscussionThreadList, {
  threadables: graphql`
    fragment DiscussionThreadList_threadables on Threadable @relay(plural: true) {
      id
      content
    }
  `
})
