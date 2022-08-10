import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import AzureDevOpsIssueId from '../shared/gqlIds/AzureDevOpsIssueId'
import {PALETTE} from '../styles/paletteV3'
import {Threshold} from '../types/constEnums'
import isTempId from '../utils/relay/isTempId'
import {AzureDevOpsScopingSearchResultItem_issue} from '../__generated__/AzureDevOpsScopingSearchResultItem_issue.graphql'
import {UpdatePokerScopeMutationVariables} from '../__generated__/UpdatePokerScopeMutation.graphql'
import Checkbox from './Checkbox'
import Ellipsis from './Ellipsis/Ellipsis'

const Item = styled('div')({
  cursor: 'pointer',
  display: 'flex',
  paddingLeft: 16,
  paddingTop: 8,
  paddingBottom: 8
})

const Issue = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: 16
})

const Title = styled('div')({})

const StyledLink = styled('a')({
  color: PALETTE.SLATE_700,
  display: 'block',
  fontSize: 12,
  lineHeight: '20px',
  textDecoration: 'none',
  '&:hover,:focus': {
    textDecoration: 'underline'
  }
})

interface Props {
  usedServiceTaskIds: Set<string>
  issueRef: AzureDevOpsScopingSearchResultItem_issue
  meetingId: string
  providerId: string
  // persistQuery: () => void
}

const AzureDevOpsScopingSearchResultItem = (props: Props) => {
  const {issueRef, meetingId, usedServiceTaskIds, providerId} = props
  const issue = useFragment(
    graphql`
      fragment AzureDevOpsScopingSearchResultItem_issue on AzureDevOpsWorkItem {
        id
        url
        state
        type
      }
    `,
    issueRef
  )
  const {id, url, state, type} = issue
  const {issueKey} = AzureDevOpsIssueId.split(id)
  const serviceTaskId = AzureDevOpsIssueId.join(providerId, id)
  const isSelected = usedServiceTaskIds.has(serviceTaskId)
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const disabled = !isSelected && usedServiceTaskIds.size >= Threshold.MAX_POKER_STORIES
  const isTemp = isTempId(serviceTaskId)

  const onClick = () => {
    if (submitting || disabled || isTemp) return
    submitMutation()
    const variables = {
      meetingId,
      updates: [
        {
          service: 'azureDevOps',
          serviceTaskId,
          action: isSelected ? 'DELETE' : 'ADD'
        }
      ]
    } as UpdatePokerScopeMutationVariables
    UpdatePokerScopeMutation(atmosphere, variables, {onError, onCompleted, contents: [id]})
    if (!isSelected) {
      // if they are adding an item, then their search criteria must be good, so persist it
      // persistQuery()
    }
  }

  return (
    <Item onClick={onClick}>
      <Checkbox active={isSelected || isTemp} disabled={disabled} />
      <Issue>
        <Title>{type + state}</Title>
        <StyledLink
          href={url}
          rel='noopener noreferrer'
          target='_blank'
          title={`Azure DevOps Work Item #${issueKey}`}
        >
          {issueKey}
          {isTemp && <Ellipsis />}
        </StyledLink>
      </Issue>
    </Item>
  )
}
export default AzureDevOpsScopingSearchResultItem
