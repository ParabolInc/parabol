import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useOverflowAvatars from '~/hooks/useOverflowAvatars'
import {TransitionStatus} from '~/hooks/useTransition'
import {TeamPromptRepliesAvatarList_edges$key} from '~/__generated__/TeamPromptRepliesAvatarList_edges.graphql'
import AvatarListUser from '../AvatarListUser'
import TeamPromptOverflowAvatar from './TeamPromptOverflowAvatar'

const Wrapper = styled('div')<{minHeight: number; width: number}>(({minHeight, width}) => ({
  position: 'relative',
  minHeight,
  width,
  marginRight: '8px'
}))

interface Props {
  edgesRef: TeamPromptRepliesAvatarList_edges$key
}

const AVATAR_SIZE = 24
const AVATAR_OVERLAP = 4
const MAX_AVATARS = 3

const TeamPromptRepliesAvatarList = (props: Props) => {
  const {edgesRef} = props
  const edges = useFragment(
    graphql`
      fragment TeamPromptRepliesAvatarList_edges on ThreadableEdge @relay(plural: true) {
        node {
          createdByUser {
            id
            ...AvatarListUser_user
          }
        }
      }
    `,
    edgesRef
  )

  const discussionUsers = edges.map((edge) => edge.node.createdByUser).filter((user) => !!user)

  const distinctDiscussionUsers = Object.values(
    Object.fromEntries(discussionUsers.map((user) => [user!.id, user!]))
  )

  const transitionChildren = useOverflowAvatars(distinctDiscussionUsers, MAX_AVATARS)

  const offsetSize = AVATAR_SIZE - AVATAR_OVERLAP

  const activeTChildren = transitionChildren.filter(
    (child) => child.status !== TransitionStatus.EXITING
  )
  const minHeight = activeTChildren.length === 0 ? 0 : AVATAR_SIZE
  const width = activeTChildren.length * AVATAR_SIZE - AVATAR_OVERLAP

  return (
    <Wrapper minHeight={minHeight} width={width}>
      {transitionChildren.map(({onTransitionEnd, child, status, displayIdx}) => {
        const {id: userId} = child
        if ('overflowCount' in child) {
          const {overflowCount} = child
          return (
            <>
              <AvatarListUser
                key={userId}
                isAnimated={true}
                user={child.overflowChild}
                onTransitionEnd={onTransitionEnd}
                status={status}
                offset={offsetSize * displayIdx}
                width={AVATAR_SIZE}
              />
              <TeamPromptOverflowAvatar
                key={`${userId}:overflowCount`}
                isAnimated={true}
                onTransitionEnd={onTransitionEnd}
                status={status}
                offset={offsetSize * displayIdx}
                overflowCount={overflowCount}
                width={AVATAR_SIZE}
              />
            </>
          )
        }
        return (
          <AvatarListUser
            key={userId}
            isAnimated={true}
            user={child}
            onTransitionEnd={onTransitionEnd}
            status={status}
            offset={offsetSize * displayIdx}
            width={AVATAR_SIZE}
          />
        )
      })}
    </Wrapper>
  )
}

export default TeamPromptRepliesAvatarList
