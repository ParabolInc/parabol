import {keyframes} from '@emotion/core'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import CreateTaskMutation from '~/mutations/CreateTaskMutation'
import {PALETTE} from '~/styles/paletteV3'
import {BezierCurve} from '~/types/constEnums'
import {SORT_STEP} from '~/utils/constants'
import dndNoise from '~/utils/dndNoise'
import {CommentSendOrAdd_discussion} from '~/__generated__/CommentSendOrAdd_discussion.graphql'
import {DECELERATE} from '../styles/animation'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'

export type CommentSubmitState = 'send' | 'add' | 'addExpanded'

const animateIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.75);
  }
	100% {
	  opacity: 1;
	  transform: scale(1);
	}
`

const SendIcon = styled(Icon)({
  animation: `${animateIn.toString()} 300ms ${DECELERATE} `,
  opacity: 1,
  color: PALETTE.SKY_500,
  fontSize: 32,
  padding: 8
})

const AddIcon = styled(Icon)<{isExpanded: boolean}>(({isExpanded}) => ({
  padding: 4,
  paddingLeft: isExpanded ? 8 : 4,
  paddingRight: isExpanded ? 8 : 4,
  transition: `all 300ms ${BezierCurve.DECELERATE} `
}))

const AddButton = styled(PlainButton)({
  alignItems: 'center',
  color: '#fff',
  backgroundColor: PALETTE.SKY_500,
  borderRadius: 16,
  display: 'flex',
  height: 32,
  padding: 0,
  maxWidth: 120,
  whiteSpace: 'nowrap',
  overflow: 'hidden'
})

const ExpandedLabel = styled('div')<{isExpanded: boolean}>(({isExpanded}) => ({
  fontSize: 14,
  fontWeight: 600,
  textAlign: 'start',
  transition: `all 300ms ${BezierCurve.DECELERATE} `,
  paddingRight: isExpanded ? 8 : 0,
  width: isExpanded ? 80 : 0
}))

const ButtonGroup = styled('div')({
  borderLeft: `1px solid ${PALETTE.SLATE_400} `,
  padding: 8,
  userSelect: 'none'
})

interface Props {
  collapseAddTask: () => void
  commentSubmitState: CommentSubmitState
  getMaxSortOrder: () => number
  discussion: CommentSendOrAdd_discussion
  threadParentId?: string
  onSubmit: () => void
  dataCy: string
}

const CommentSendOrAdd = (props: Props) => {
  const {
    collapseAddTask,
    commentSubmitState,
    getMaxSortOrder,
    discussion,
    threadParentId,
    onSubmit,
    dataCy
  } = props
  const {id: discussionId, meetingId, teamId} = discussion
  const atmosphere = useAtmosphere()
  if (commentSubmitState === 'send') {
    return (
      <PlainButton data-cy={`${dataCy}-send`} onClick={onSubmit}>
        <SendIcon>send</SendIcon>
      </PlainButton>
    )
  }
  const addTask = () => {
    const {viewerId} = atmosphere
    const newTask = {
      status: 'active',
      sortOrder: dndNoise(),
      discussionId,
      meetingId,
      threadParentId,
      threadSortOrder: getMaxSortOrder() + SORT_STEP + dndNoise(),
      userId: viewerId,
      teamId
    } as const
    CreateTaskMutation(atmosphere, {newTask}, {})
    collapseAddTask()
    commitLocalUpdate(atmosphere, (store) => {
      store
        .getRoot()
        .getLinkedRecord('viewer')
        ?.getLinkedRecord('discussion', {id: discussionId})
        ?.setValue('', 'replyingToCommentId')
    })
  }
  const isExpanded = commentSubmitState === 'addExpanded'
  return (
    <ButtonGroup data-cy={`${dataCy}-add`}>
      <AddButton onClick={addTask}>
        <AddIcon isExpanded={isExpanded}>playlist_add_check</AddIcon>
        <ExpandedLabel isExpanded={isExpanded}>Add a Task</ExpandedLabel>
      </AddButton>
    </ButtonGroup>
  )
}

export default createFragmentContainer(CommentSendOrAdd, {
  discussion: graphql`
    fragment CommentSendOrAdd_discussion on Discussion {
      id
      teamId
      meetingId
    }
  `
})
