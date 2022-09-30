import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {EmojiUsersReaction_reactji$key} from '~/__generated__/EmojiUsersReaction_reactji.graphql'

const EmojiUsersReactionRoot = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  maxHeight: 300,
  maxWidth: 280,
  overflow: 'auto',
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
  whiteSpace: 'normal'
})

const LIST_FORMATTER =
  Intl.ListFormat !== undefined
    ? new Intl.ListFormat('en', {style: 'long', type: 'conjunction'})
    : {format: (arr: string[]) => arr.join(', ')} // fallback for safari pre Big Sur

interface Props {
  reactjiRef: EmojiUsersReaction_reactji$key
}

const EmojiUsersReaction = ({reactjiRef}: Props) => {
  const reactji = useFragment(
    graphql`
      fragment EmojiUsersReaction_reactji on Reactji {
        id
        users {
          id
          preferredName
          picture
        }
      }
    `,
    reactjiRef
  )

  return (
    <EmojiUsersReactionRoot>
      {LIST_FORMATTER.format(reactji.users.map(({preferredName}) => preferredName))}
    </EmojiUsersReactionRoot>
  )
}

export default React.memo(EmojiUsersReaction)
