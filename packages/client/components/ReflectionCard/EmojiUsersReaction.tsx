import graphql from 'babel-plugin-relay/macro'
import {memo} from 'react'
import {useFragment} from 'react-relay'
import type {EmojiUsersReaction_reactji$key} from '~/__generated__/EmojiUsersReaction_reactji.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'

const LIST_FORMATTER =
  Intl.ListFormat !== undefined
    ? new Intl.ListFormat('en', {style: 'long', type: 'conjunction'})
    : {format: (arr: string[]) => arr.join(', ')} // fallback for safari pre Big Sur

interface Props {
  reactjiRef: EmojiUsersReaction_reactji$key
  reactjiName?: string
}

const EmojiUsersReaction = ({reactjiRef, reactjiName}: Props) => {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {users} = useFragment(
    graphql`
      fragment EmojiUsersReaction_reactji on Reactji {
        id
        users {
          id
          preferredName
        }
      }
    `,
    reactjiRef
  )
  const userNames: string[] = []
  users.forEach(({id, preferredName}) =>
    id === viewerId ? userNames.unshift('You') : userNames.push(preferredName)
  )

  return (
    <div className='wrap-break-word flex max-h-75 max-w-70 flex-col items-center justify-center overflow-auto whitespace-normal'>
      {LIST_FORMATTER.format(userNames)}
      {reactjiName && <span className='text-fg-muted'>reacted with {reactjiName}</span>}
    </div>
  )
}

export default memo(EmojiUsersReaction)
