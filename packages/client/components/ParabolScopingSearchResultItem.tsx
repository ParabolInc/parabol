import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import React, {useMemo, useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {ParabolScopingSearchResultItem_task} from '../__generated__/ParabolScopingSearchResultItem_task.graphql'
import Checkbox from './Checkbox'
import useAtmosphere from '~/hooks/useAtmosphere'
import UpdatePokerScopeMutation from '~/mutations/UpdatePokerScopeMutation'
import {TaskServiceEnum} from '~/types/graphql'
import {AddOrDeleteEnum} from '~/types/graphql'
import useMutationProps from '~/hooks/useMutationProps'
import {convertFromRaw, EditorState, Editor, ContentState} from 'draft-js'
import editorDecorators from './TaskEditor/decorators'

const Item = styled('div')({
  display: 'flex',
  paddingLeft: 16,
  paddingTop: 8,
  paddingBottom: 8
})

const Task = styled('div')({
  paddingLeft: 16
})

interface Props {
  meetingId: string
  isSelected: boolean
  task: ParabolScopingSearchResultItem_task
}

const ParabolScopingSearchResultItem = (props: Props) => {
  const {task, meetingId, isSelected} = props
  const {id: serviceTaskId, content} = task
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const contentState = useMemo(() => convertFromRaw(JSON.parse(content)), [content])
  const editorStateRef = useRef<EditorState>()
  editorStateRef.current = EditorState.createWithContent(
    ContentState.createFromBlockArray([contentState.getFirstBlock()]),
    editorDecorators(() => editorStateRef.current)
  )
  const onClick = () => {
    if (submitting) return
    submitMutation()
    const variables = {
      meetingId,
      updates: [
        {
          service: TaskServiceEnum.PARABOL,
          serviceTaskId,
          action: isSelected ? AddOrDeleteEnum.DELETE : AddOrDeleteEnum.ADD
        }
      ]
    }
    UpdatePokerScopeMutation(atmosphere, variables, {onError, onCompleted})
  }
  return (
    <Item onClick={onClick}>
      <Checkbox active={isSelected} />
      <Task>
        <Editor
          readOnly
          editorState={editorStateRef.current}
          onChange={() => {}}
        />
      </Task>
    </Item>
  )
}

export default createFragmentContainer(ParabolScopingSearchResultItem, {
  task: graphql`
    fragment ParabolScopingSearchResultItem_task on Task {
      id
      content
      plaintextContent
    }
  `
})
