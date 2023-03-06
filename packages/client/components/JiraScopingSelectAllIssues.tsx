import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useUnusedRecords from '~/hooks/useUnusedRecords'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import {PALETTE} from '../styles/paletteV3'
import {Threshold} from '../types/constEnums'
import getSelectAllTitle from '../utils/getSelectAllTitle'
import {JiraScopingSelectAllIssues_issues$key} from '../__generated__/JiraScopingSelectAllIssues_issues.graphql'
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
  issues: JiraScopingSelectAllIssues_issues$key
  usedServiceTaskIds: Set<string>
}

const JiraScopingSelectAllIssues = (props: Props) => {
  const {meetingId, usedServiceTaskIds, issues: issuesRef} = props
  const issues = useFragment(
    graphql`
      fragment JiraScopingSelectAllIssues_issues on JiraIssueEdge @relay(plural: true) {
        node {
          id
          summary
        }
      }
    `,
    issuesRef
  )
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, error} = useMutationProps()
  const serviceTaskIds = issues.map((issueEdge) => issueEdge.node.id)
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
          service: 'jira',
          serviceTaskId,
          action
        } as const)
    )

    const variables = {
      meetingId,
      updates
    }
    const contents = updates.map((update) => {
      const issue = issues.find((issueEdge) => issueEdge.node.id === update.serviceTaskId)
      return issue?.node.summary ?? 'Unknown Story'
    })
    UpdatePokerScopeMutation(atmosphere, variables, {
      onError,
      onCompleted,
      contents,
      selectedAll: true
    })
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

export default JiraScopingSelectAllIssues
