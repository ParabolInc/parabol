import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useOverflowAvatars from '~/hooks/useOverflowAvatars'
import {TransitionStatus} from '~/hooks/useTransition'
import {TeamPromptRepliesAvatarList_discussion$key} from '~/__generated__/TeamPromptRepliesAvatarList_discussion.graphql'
import AvatarListUser from '../AvatarListUser'
import OverflowAvatar from '../OverflowAvatar'

const Wrapper = styled('div')<{minHeight: number; width: number}>(({minHeight, width}) => ({
  position: 'relative',
  minHeight,
  width,
  marginRight: '8px'
}))

interface Props {
  discussionRef: TeamPromptRepliesAvatarList_discussion$key
}

const SIZE = 24
const OVERLAP = 4
const MAX_AVATARS = 2

const TeamPromptRepliesAvatarList = (props: Props) => {
  const {discussionRef} = props
  const discussion = useFragment(
    graphql`
      fragment TeamPromptRepliesAvatarList_discussion on Discussion {
        thread(first: 1000) @connection(key: "DiscussionThread_thread") {
          edges {
            node {
              createdByUser {
                id
                ...AvatarListUser_user
              }
            }
          }
        }
      }
    `,
    discussionRef
  )

  const discussionUsers = discussion.thread.edges
    .map((node) => node.node.createdByUser)
    .filter((user) => !!user)

  const distinctDiscussionUsers = Object.values(
    Object.fromEntries(discussionUsers.map((user) => [user!.id, user!]))
  )

  const transitionChildren = useOverflowAvatars(distinctDiscussionUsers, MAX_AVATARS)

  const offsetSize = SIZE - OVERLAP

  const activeTChildren = transitionChildren.filter(
    (child) => child.status !== TransitionStatus.EXITING
  )
  const minHeight = activeTChildren.length === 0 ? 0 : SIZE
  const width = activeTChildren.length * SIZE - OVERLAP

  return (
    <Wrapper minHeight={minHeight} width={width}>
      {transitionChildren.map(({onTransitionEnd, child, status, displayIdx}) => {
        const {id: userId} = child
        if ('overflowCount' in child) {
          const {overflowCount} = child
          return (
            <OverflowAvatar
              key={userId}
              isAnimated={false}
              onTransitionEnd={onTransitionEnd}
              status={status}
              offset={offsetSize * displayIdx}
              overflowCount={overflowCount}
              width={SIZE}
            />
          )
        }
        return (
          <AvatarListUser
            key={userId}
            isAnimated={false}
            user={child}
            onTransitionEnd={onTransitionEnd}
            status={status}
            offset={offsetSize * displayIdx}
            width={SIZE}
          />
        )
      })}
    </Wrapper>
  )
}

export default TeamPromptRepliesAvatarList
