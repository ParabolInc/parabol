import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useUnusedRecords from '~/hooks/useUnusedRecords'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import AzureDevOpsIssueId from '../shared/gqlIds/AzureDevOpsIssueId'
import {PALETTE} from '../styles/paletteV3'
import {Threshold} from '../types/constEnums'
import getSelectAllTitle from '../utils/getSelectAllTitle'
import {AzureDevOpsScopingSelectAllIssues_userStories} from '../__generated__/AzureDevOpsScopingSelectAllIssues_userStories.graphql'
import Checkbox from './Checkbox'

const Item = styled('div')({
  display: 'flex',
  padding: '8px 16px',
  cursor: 'pointer'
})

const Title = styled('div')({})

const TitleAndError = styled('div')({
  display: 'flex',
  fontWeight: 600,
  flexDirection: 'column',
  paddingLeft: 16,
  paddingBottom: 20 // total height is 56
})

const ErrorMessage = styled('div')({
  color: PALETTE.TOMATO_500,
  fontWeight: 600
})
interface Props {
  meetingId: string
  userStories: AzureDevOpsScopingSelectAllIssues_userStories
  usedServiceTaskIds: Set<string>
  providerId: string
}

const AzureDevOpsScopingSelectAllIssues = (props: Props) => {
  const {meetingId, usedServiceTaskIds, userStories, providerId} = props
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting, error} = useMutationProps()
  const serviceTaskIds = userStories.map((userStory) =>
    AzureDevOpsIssueId.join(providerId, userStory.id)
  )
  const [unusedServiceTaskIds, allSelected] = useUnusedRecords(serviceTaskIds, usedServiceTaskIds)
  const availableCountToAdd = Threshold.MAX_POKER_STORIES - usedServiceTaskIds.size
  const onClick = () => {
    submitMutation()
    const updateArr = allSelected === true ? serviceTaskIds : unusedServiceTaskIds
    const action = allSelected === true ? 'DELETE' : 'ADD'
    const limit = action === 'ADD' ? availableCountToAdd : 1e6
    const updates = updateArr.slice(0, limit).map(
      (serviceTaskId) =>
        ({
          service: 'azureDevOps',
          serviceTaskId,
          action
        } as const)
    )

    const variables = {
      meetingId,
      updates
    }
    const contents = updates.map((update) => {
      const userStory = userStories.find(
        (userStoryEdge) => userStoryEdge.node.id === update.serviceTaskId
      )
      return userStory?.node.summary ?? 'Unknown Story'
    })
    UpdatePokerScopeMutation(atmosphere, variables, {onError, onCompleted, contents})
  }
  if (userStories.length < 2) return null
  const title = getSelectAllTitle(userStories.length, usedServiceTaskIds.size, 'userStory')

  return (
    <>
      <Item onClick={onClick}>
        <Checkbox active={allSelected} />
        <TitleAndError>
          <Title>{title}</Title>
          {error && <ErrorMessage>{error.message}</ErrorMessage>}
        </TitleAndError>
      </Item>
    </>
  )
}

export default createFragmentContainer(AzureDevOpsScopingSelectAllIssues, {
  userStories: graphql`
    fragment AzureDevOpsScopingSelectAllIssues_userStories on AzureDevOpsWorkItemEdge
    @relay(plural: true) {
      node {
        id
      }
    }
  `
})
