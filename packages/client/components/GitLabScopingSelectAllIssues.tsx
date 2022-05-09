import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useUnusedRecords from '~/hooks/useUnusedRecords'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import GitLabIssueId from '../shared/gqlIds/GitLabIssueId'
import {PALETTE} from '../styles/paletteV3'
import {Threshold} from '../types/constEnums'
import getSelectAllTitle from '../utils/getSelectAllTitle'
import {GitLabScopingSelectAllIssues_issues$key} from '../__generated__/GitLabScopingSelectAllIssues_issues.graphql'
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
  issuesRef: GitLabScopingSelectAllIssues_issues$key
  usedServiceTaskIds: Set<string>
  providerId: string
}

const GitLabScopingSelectAllIssues = (props: Props) => {
  const {meetingId, usedServiceTaskIds, issuesRef, providerId} = props
  const issues = useFragment(
    graphql`
      fragment GitLabScopingSelectAllIssues_issues on _xGitLabIssue @relay(plural: true) {
        id
        title
      }
    `,
    issuesRef
  )
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting, error} = useMutationProps()
  const serviceTaskIds = issues.map((issue) => GitLabIssueId.join(providerId, issue.id))
  const [unusedServiceTaskIds, allSelected] = useUnusedRecords(
    serviceTaskIds,
    usedServiceTaskIds,
    Threshold.MAX_GITLAB_POKER_STORIES
  )
  const availableCountToAdd = Threshold.MAX_GITLAB_POKER_STORIES - usedServiceTaskIds.size
  const onClick = () => {
    if (submitting) return
    submitMutation()
    const updateArr = allSelected === true ? serviceTaskIds : unusedServiceTaskIds
    const action = allSelected === true ? 'DELETE' : 'ADD'
    const limit = action === 'ADD' ? availableCountToAdd : 1e6
    const updates = updateArr.slice(0, limit).map(
      (serviceTaskId) =>
        ({
          service: 'gitlab',
          serviceTaskId,
          action
        } as const)
    )

    const variables = {
      meetingId,
      updates
    }
    const contents = updates.map((update) => {
      const issue = issues.find(
        (issue) => GitLabIssueId.join(providerId, issue.id) === update.serviceTaskId
      )
      return issue?.title ?? 'Unknown Story'
    })
    UpdatePokerScopeMutation(atmosphere, variables, {
      onError,
      onCompleted,
      contents,
      selectedAll: true
    })
  }
  if (issues.length < 2) return null
  const title = getSelectAllTitle(
    issues.length,
    usedServiceTaskIds.size,
    'issue',
    Threshold.MAX_GITLAB_POKER_STORIES
  )

  return (
    <Item onClick={onClick}>
      <Checkbox active={allSelected} />
      <TitleAndError>
        <Title>{title}</Title>
        {error && <ErrorMessage>{error.message}</ErrorMessage>}
      </TitleAndError>
    </Item>
  )
}

export default GitLabScopingSelectAllIssues
