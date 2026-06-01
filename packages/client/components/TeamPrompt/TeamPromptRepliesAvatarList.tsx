import graphql from 'babel-plugin-relay/macro'
import {AnimatePresence} from 'motion/react'
import {useFragment} from 'react-relay'
import type {TeamPromptRepliesAvatarList_edges$key} from '~/__generated__/TeamPromptRepliesAvatarList_edges.graphql'
import useOverflowAvatars from '~/hooks/useOverflowAvatars'
import AvatarListUser from '../AvatarListUser'
import TeamPromptOverflowAvatar from './TeamPromptOverflowAvatar'

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

  const avatars = useOverflowAvatars(distinctDiscussionUsers, MAX_AVATARS)
  const offsetSize = AVATAR_SIZE - AVATAR_OVERLAP
  const minHeight = avatars.length === 0 ? 0 : AVATAR_SIZE
  const width = avatars.length * AVATAR_SIZE - AVATAR_OVERLAP

  return (
    <div className='relative mr-2' style={{minHeight, width}}>
      <AnimatePresence initial={false}>
        {avatars.map((child, idx) => {
          const {id: userId} = child
          if ('overflowCount' in child) {
            const {overflowCount, displayIdx} = child
            return (
              <TeamPromptOverflowAvatar
                key={userId}
                offset={offsetSize * displayIdx}
                overflowCount={overflowCount}
                width={AVATAR_SIZE}
              />
            )
          }
          return (
            <AvatarListUser
              key={userId}
              user={child}
              offset={offsetSize * idx}
              className='h-6 w-6'
            />
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default TeamPromptRepliesAvatarList
