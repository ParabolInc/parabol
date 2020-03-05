import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import useMutationProps from 'hooks/useMutationProps'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from 'styles/paletteV2'
import {AreaEnum} from 'types/graphql'
import relativeDate from 'utils/date/relativeDate'
import {ThreadedComment_comment} from '__generated__/ThreadedComment_comment.graphql'
import AddReactjiButton from './ReflectionCard/AddReactjiButton'
import ThreadedAvatarColumn from './ThreadedAvatarColumn'

const Wrapper = styled('div')({
  display: 'flex',
  width: '100%'
})

const BodyCol = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: 8,
  width: '100%'
})

const Header = styled('div')({
  display: 'flex',
  fontSize: 12,
  justifyContent: 'space-between',
  paddingBottom: 8,
  width: '100%'
})

const HeaderDescription = styled('div')({
  display: 'flex'
})

const HeaderName = styled('div')({
  color: PALETTE.TEXT_MAIN,
  fontWeight: 600
})

const HeaderResult = styled('div')({
  color: PALETTE.TEXT_GRAY,
  whiteSpace: 'pre-wrap'
})

const HeaderActions = styled('div')({
  color: PALETTE.TEXT_GRAY,
  fontWeight: 600,
  paddingRight: 12
})

interface Props {
  comment: ThreadedComment_comment
}

const ThreadedComment = (props: Props) => {
  const {comment} = props
  const {createdByUser, reactjis, updatedAt} = comment
  const {picture, preferredName} = createdByUser
  const hasReactjis = reactjis.length > 0
  const {submitMutation, submitting} = useMutationProps()
  const onToggleReactji = (_emojiId: string) => {
    if (submitting) return
    // const isRemove = !!reactjis.find((reactji) => {
    // return reactji.isViewerReactji && reactji.id.split(':')[1] === emojiId
    // })
    submitMutation()
    // AddReactjiToReflectionMutation(
    //   atmosphere,
    //   {reflectionId, isRemove, reactji: emojiId},
    //   {onCompleted, onError}
    // )
  }
  return (
    <Wrapper>
      <ThreadedAvatarColumn picture={picture} />
      <BodyCol>
        <Header>
          <HeaderDescription>
            <HeaderName>{preferredName}</HeaderName>
            <HeaderResult> {relativeDate(updatedAt)}</HeaderResult>
          </HeaderDescription>
          {!hasReactjis && (
            <>
              <AddReactjiButton onToggle={onToggleReactji} />
              <HeaderActions>Reply</HeaderActions>
            </>
          )}
        </Header>
      </BodyCol>
    </Wrapper>
  )
}

export default createFragmentContainer(ThreadedComment, {
  comment: graphql`
    fragment ThreadedComment_comment on Comment {
      id
      content
      createdByUser {
        picture
        preferredName
      }
      reactjis {
        id
        isViewerReactji
      }
      updatedAt
    }
  `
})
