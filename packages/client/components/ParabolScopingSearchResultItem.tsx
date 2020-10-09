import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ParabolScopingSearchResultItem_task} from '../__generated__/ParabolScopingSearchResultItem_task.graphql'
import Checkbox from './Checkbox'
import useAtmosphere from '~/hooks/useAtmosphere'
import UpdatePokerScopeMutation from '~/mutations/UpdatePokerScopeMutation'
import {TaskServiceEnum} from '~/types/graphql'
import {AddOrDeleteEnum} from '~/types/graphql'
import useMutationProps from '~/hooks/useMutationProps'

const Item = styled('div')({
  display: 'flex',
  paddingLeft: 16,
  paddingTop: 8,
  paddingBottom: 8
})

const Issue = styled('div')({
  paddingLeft: 16
})

const Title = styled('div')({})

interface Props {
  task: ParabolScopingSearchResultItem_task
  meetingId: string
  isSelected: boolean
}

const ParabolScopingSearchResultItem = (props: Props) => {
  const {task, meetingId, isSelected} = props
  const {id: serviceTaskId, plaintextContent} = task
  const snippet = plaintextContent.split('\n')[0]
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
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
      <Issue>
        <Title>{snippet}</Title>
      </Issue>
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
