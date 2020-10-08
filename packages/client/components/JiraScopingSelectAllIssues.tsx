import styled from '@emotion/styled'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import {AddOrDeleteEnum, TaskServiceEnum} from '../types/graphql'
import Checkbox from './Checkbox'
import graphql from 'babel-plugin-relay/macro'
import {JiraScopingSelectAllIssues_issues} from '../__generated__/JiraScopingSelectAllIssues_issues.graphql'

const Item = styled('div')({
  display: 'flex',
  padding: '8px 16px',
  cursor: 'pointer'
})

const Title = styled('div')({
  paddingLeft: 16,
  paddingBottom: 20, // total height is 56
  fontWeight: 600
})
interface Props {
  meetingId: string
  issues: JiraScopingSelectAllIssues_issues
  usedJiraIssueIds: Set<string>

}

const JiraScopingSelectAllIssues = (props: Props) => {
  const {meetingId, usedJiraIssueIds, issues} = props
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const unusedIssues = useMemo(() => {
    const unusedIssues = [] as string[]
    issues.forEach(({node}) => {
      if (!usedJiraIssueIds.has(node.id)) {
        unusedIssues.push(node.id)
      }
    })
    return unusedIssues
  }, [usedJiraIssueIds, issues])
  const selectAll = unusedIssues.length === 0 ? true : unusedIssues.length === issues.length ? false : null

  const onClick = () => {
    if (submitting) return
    submitMutation()
    const updateArr = selectAll === true ? Array.from(usedJiraIssueIds) : unusedIssues
    const action = selectAll === true ? AddOrDeleteEnum.DELETE : AddOrDeleteEnum.ADD
    const updates = updateArr.map((serviceTaskId) => ({
      service: TaskServiceEnum.jira,
      serviceTaskId,
      action
    }))

    const variables = {
      meetingId,
      updates
    }
    UpdatePokerScopeMutation(atmosphere, variables, {onError, onCompleted})
  }
  if (issues.length < 2) return null
  return (
    <Item onClick={onClick}>
      <Checkbox active={selectAll} onClick={() => console.log('click')} />
      <Title>{`Select all ${issues.length} issues`}</Title>
    </Item>
  )
}

export default createFragmentContainer(JiraScopingSelectAllIssues, {
  issues: graphql`
    fragment JiraScopingSelectAllIssues_issues on JiraIssueEdge @relay(plural: true) {
      node {
        id
      }
    }
  `
})
