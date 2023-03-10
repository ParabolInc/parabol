import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {ThreadedCommentFooter_reactjis$key} from '~/__generated__/ThreadedCommentFooter_reactjis.graphql'
import ReactjiSection from './ReflectionCard/ReactjiSection'
import ThreadedReplyButton from './ThreadedReplyButton'

const FooterActions = styled('div')({
  alignItems: 'center',
  color: PALETTE.SLATE_600,
  display: 'flex',
  fontSize: 12,
  fontWeight: 600,
  paddingRight: 12
})

const StyledReactjis = styled(ReactjiSection)({
  paddingLeft: 8
})

interface Props {
  onReply: () => void
  onToggleReactji: (emojiId: string) => void
  reactjis: ThreadedCommentFooter_reactjis$key
}

const ThreadedCommentFooter = (props: Props) => {
  const {onReply, onToggleReactji, reactjis: reactjisRef} = props
  const reactjis = useFragment(
    graphql`
      fragment ThreadedCommentFooter_reactjis on Reactji @relay(plural: true) {
        ...ReactjiSection_reactjis
        id
      }
    `,
    reactjisRef
  )
  const hasReactjis = reactjis.length > 0
  if (!hasReactjis) return null
  return (
    <FooterActions>
      <ThreadedReplyButton dataCy={`comment-footer`} onReply={onReply} />
      <StyledReactjis reactjis={reactjis} onToggle={onToggleReactji} />
    </FooterActions>
  )
}

export default ThreadedCommentFooter
