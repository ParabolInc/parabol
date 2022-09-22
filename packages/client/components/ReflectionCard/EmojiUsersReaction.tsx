import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {EmojiUsersReaction_reactji$key} from '~/__generated__/EmojiUsersReaction_reactji.graphql'

//TODO: remove after migrating to es2021 - https://github.com/microsoft/TypeScript/issues/46907
declare namespace Intl {
  type ListType = 'conjunction' | 'disjunction'

  interface ListFormatOptions {
    localeMatcher?: 'lookup' | 'best fit'
    type?: ListType
    style?: 'long' | 'short' | 'narrow'
  }

  class ListFormat {
    constructor(locales?: string | string[], options?: ListFormatOptions)
    format(values: any[]): string
  }
}

const EmojiUsersReactionParent = styled('div')({
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

const Emoji = styled('div')({
  fontFamily: 'sans-serif',
  fontSize: 32,
  height: 48,
  lineHeight: '48px',
  textAlign: 'center'
})

const LIST_FORMATTER = new Intl.ListFormat('en', {style: 'long', type: 'conjunction'})

interface Props {
  unicode: any
  reactjiRef: EmojiUsersReaction_reactji$key
}

const EmojiUsersReaction = ({unicode, reactjiRef}: Props) => {
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
    <EmojiUsersReactionParent>
      <Emoji>{unicode}</Emoji>
      {LIST_FORMATTER.format(reactji.users.map(({preferredName}) => preferredName))}
    </EmojiUsersReactionParent>
  )
}

export default React.memo(EmojiUsersReaction)
