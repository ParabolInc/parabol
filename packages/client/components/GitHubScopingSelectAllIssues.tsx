import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useUnusedRecords from '~/hooks/useUnusedRecords'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import {PALETTE} from '../styles/paletteV3'
import {Threshold} from '../types/constEnums'
import getSelectAllTitle from '../utils/getSelectAllTitle'
import {GitHubScopingSelectAllIssues_issues} from '../__generated__/GitHubScopingSelectAllIssues_issues.graphql'
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
  issues: GitHubScopingSelectAllIssues_issues
  usedServiceTaskIds: Set<string>
}

const GitHubScopingSelectAllIssues = (props: Props) => {
  const {meetingId, usedServiceTaskIds, issues} = props
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting, error} = useMutationProps()
  const issueEdges = issues.map((issue) => ({node: issue}))
  const [unusedServiceTaskIds, allSelected] = useUnusedRecords(issueEdges, usedServiceTaskIds)
  const availableCountToAdd = Threshold.MAX_POKER_STORIES - usedServiceTaskIds.size
  const onClick = () => {
    if (submitting) return
    submitMutation()
    const serviceTaskIds = issues.map((issue) => issue.id)
    const updateArr = allSelected === true ? serviceTaskIds : unusedServiceTaskIds
    const action = allSelected === true ? 'DELETE' : 'ADD'
    const limit = action === 'ADD' ? availableCountToAdd : 1e6
    const updates = updateArr.slice(0, limit).map(
      (serviceTaskId) =>
        ({
          service: 'github',
          serviceTaskId,
          action
        } as const)
    )

    const variables = {
      meetingId,
      updates
    }
    const contents = updates.map((update) => {
      const issue = issues.find((issue) => issue.id === update.serviceTaskId)
      return issue?.title ?? 'Unknown Story'
    })
    UpdatePokerScopeMutation(atmosphere, variables, {onError, onCompleted, contents})
  }
  if (issues.length < 2) return null
  const title = getSelectAllTitle(issues.length, usedServiceTaskIds.size, 'issue')

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

export default createFragmentContainer(GitHubScopingSelectAllIssues, {
  issues: graphql`
    fragment GitHubScopingSelectAllIssues_issues on _xGitHubIssue @relay(plural: true) {
      id
      title
    }
  `
})
