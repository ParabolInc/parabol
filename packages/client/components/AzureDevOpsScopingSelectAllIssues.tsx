import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useUnusedRecords from '~/hooks/useUnusedRecords'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import AzureDevOpsIssueId from '../shared/gqlIds/AzureDevOpsIssueId'
import {PALETTE} from '../styles/paletteV3'
import {Threshold} from '../types/constEnums'
import AzureDevOpsClientManager from '../utils/AzureDevOpsClientManager'
import getSelectAllTitle from '../utils/getSelectAllTitle'
import {AzureDevOpsScopingSelectAllIssues_workItems$key} from '../__generated__/AzureDevOpsScopingSelectAllIssues_workItems.graphql'
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
  workItems: AzureDevOpsScopingSelectAllIssues_workItems$key
  usedServiceTaskIds: Set<string>
  providerId: string
}

const AzureDevOpsScopingSelectAllIssues = (props: Props) => {
  const {meetingId, usedServiceTaskIds, workItems: workItemsRef, providerId} = props
  const workItems = useFragment(
    graphql`
      fragment AzureDevOpsScopingSelectAllIssues_workItems on AzureDevOpsWorkItemEdge
      @relay(plural: true) {
        node {
          id
          title
          url
        }
      }
    `,
    workItemsRef
  )
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting, error} = useMutationProps()
  const getProjectId = (url: URL) => {
    const firstIndex = url.pathname.indexOf('/', 1)
    const seconedIndex = url.pathname.indexOf('/', firstIndex + 1)
    return url.pathname.substring(firstIndex + 1, seconedIndex)
  }

  const serviceTaskIds = workItems.map((userStory) => {
    const url = new URL(userStory.node.url)
    return AzureDevOpsIssueId.join(
      AzureDevOpsClientManager.getInstanceId(url),
      getProjectId(url),
      userStory.node.id
    )
  })

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
      const workItem = workItems.find(
        (workItemEdge) => workItemEdge.node.id === update.serviceTaskId
      )
      return workItem?.node.title ?? 'Unknown Work Item'
    })
    UpdatePokerScopeMutation(atmosphere, variables, {onError, onCompleted, contents})
  }
  if (workItems.length < 2) return null
  const title = getSelectAllTitle(workItems.length, usedServiceTaskIds.size, 'workItem')

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

export default AzureDevOpsScopingSelectAllIssues
